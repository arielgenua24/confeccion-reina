/**
 * Sync Worker - Background Sync Queue Processing
 *
 * Processes queued sync tasks in the background:
 * - Handles pending orders that need to be synced to Firestore
 * - Processes sync queue with retry logic
 * - Respects network conditions and priority
 */

import {
  getPendingSyncTasks,
  updateSyncTask,
  getPendingOrders,
  updatePendingOrder
} from './cacheService';

import { db as firestore } from '../firebaseSetUp';
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';

class SyncWorker {
  constructor() {
    this.isRunning = false;
    this.processingInterval = null;
    this.maxRetries = 3;
    this.retryDelays = [1000, 5000, 30000]; // 1s, 5s, 30s

    // Configuration
    this.PROCESSING_INTERVAL_MS = 10 * 1000; // Check queue every 10 seconds
    this.BATCH_SIZE = 5; // Process up to 5 tasks at once
  }

  /**
   * Start the background worker
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ SyncWorker already running');
      return;
    }

    console.log('🔧 Starting SyncWorker...');
    this.isRunning = true;

    // Process immediately on start
    this.processQueue();

    // Set up periodic processing
    this.processingInterval = setInterval(() => {
      if (navigator.onLine) {
        this.processQueue();
      }
    }, this.PROCESSING_INTERVAL_MS);

    console.log('✅ SyncWorker started');
  }

  /**
   * Stop the background worker
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('⏹️ Stopping SyncWorker...');
    this.isRunning = false;

    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    console.log('✅ SyncWorker stopped');
  }

  /**
   * Process sync queue
   * Main processing loop
   */
  async processQueue() {
    if (!navigator.onLine) {
      console.log('📴 Offline, skipping queue processing');
      return;
    }

    try {
      // Get pending tasks sorted by priority and nextRetryAt
      const tasks = await getPendingSyncTasks(this.BATCH_SIZE);

      if (tasks.length === 0) {
        return;
      }

      console.log(`📋 Processing ${tasks.length} sync tasks...`);

      // Process each task
      for (const task of tasks) {
        await this.processTask(task);
      }
    } catch (error) {
      console.error('❌ Error processing sync queue:', error);
    }
  }

  /**
   * Process a single sync task
   *
   * @param {Object} task - Sync task from queue
   */
  async processTask(task) {
    const { taskId, type, payload, attempts = 0 } = task;

    try {
      console.log(`🔄 Processing task ${taskId} (${type})`);

      // Update task status to processing
      await updateSyncTask(taskId, {
        status: 'processing',
        lastAttemptAt: new Date().toISOString()
      });

      let result;
      switch (type) {
        case 'sync_order':
          result = await this.syncOrder(payload);
          break;
        case 'sync_product_update':
          result = await this.syncProductUpdate(payload);
          break;
        default:
          console.warn(`Unknown task type: ${type}`);
          result = { success: false, error: 'Unknown task type' };
      }

      if (result.success) {
        // Mark task as completed
        await updateSyncTask(taskId, {
          status: 'completed',
          completedAt: new Date().toISOString(),
          result: result.data
        });
        console.log(`✅ Task ${taskId} completed`);
      } else {
        // Handle failure
        await this.handleTaskFailure(taskId, attempts, result.error);
      }
    } catch (error) {
      console.error(`❌ Error processing task ${taskId}:`, error);
      await this.handleTaskFailure(taskId, attempts, error.message);
    }
  }

  /**
   * Handle task failure with retry logic
   *
   * @param {string} taskId - Task ID
   * @param {number} attempts - Current attempt count
   * @param {string} error - Error message
   */
  async handleTaskFailure(taskId, attempts, error) {
    const newAttempts = attempts + 1;

    if (newAttempts >= this.maxRetries) {
      // Max retries reached, mark as failed
      await updateSyncTask(taskId, {
        status: 'failed',
        attempts: newAttempts,
        lastError: error,
        failedAt: new Date().toISOString()
      });
      console.error(`❌ Task ${taskId} failed after ${newAttempts} attempts`);
    } else {
      // Schedule retry
      const delay = this.retryDelays[newAttempts - 1] || 30000;
      const nextRetryAt = new Date(Date.now() + delay).toISOString();

      await updateSyncTask(taskId, {
        status: 'pending',
        attempts: newAttempts,
        lastError: error,
        nextRetryAt
      });
      console.log(`⏰ Task ${taskId} scheduled for retry in ${delay / 1000}s`);
    }
  }

  /**
   * Sync an order to Firestore
   *
   * @param {Object} payload - Order data
   * @returns {Promise<Object>} - { success, data?, error? }
   */
  async syncOrder(payload) {
    try {
      const { orderId } = payload;

      // Get pending order from IndexedDB
      const pendingOrders = await getPendingOrders();
      const order = pendingOrders.find(o => o.orderId === orderId);

      if (!order) {
        return {
          success: false,
          error: 'Order not found in pending orders'
        };
      }

      // Check if order already exists in Firestore
      const orderRef = doc(firestore, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        // Order already synced, mark as completed
        await updatePendingOrder(orderId, { status: 'synced' });
        return {
          success: true,
          data: { message: 'Order already exists in Firestore' }
        };
      }

      // Create batch write
      const batch = writeBatch(firestore);

      // Add order to Firestore
      batch.set(orderRef, {
        ...order.orderData,
        syncedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // Commit batch
      await batch.commit();

      // Update pending order status
      await updatePendingOrder(orderId, {
        status: 'synced',
        syncedAt: new Date().toISOString()
      });

      console.log(`✅ Order ${orderId} synced to Firestore`);

      return {
        success: true,
        data: { orderId }
      };
    } catch (error) {
      console.error('❌ Failed to sync order:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sync a product update to Firestore
   * (For future use when products can be edited offline)
   *
   * @param {Object} payload - Product update data
   * @returns {Promise<Object>} - { success, data?, error? }
   */
  async syncProductUpdate(payload) {
    try {
      const { productId, updates } = payload;

      const productRef = doc(firestore, 'products', productId);
      const batch = writeBatch(firestore);

      batch.update(productRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Update catalog metadata
      const metadataRef = doc(firestore, 'metadata', 'catalog');
      batch.set(
        metadataRef,
        { lastUpdated: serverTimestamp() },
        { merge: true }
      );

      await batch.commit();

      console.log(`✅ Product ${productId} update synced to Firestore`);

      return {
        success: true,
        data: { productId }
      };
    } catch (error) {
      console.error('❌ Failed to sync product update:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get worker status
   *
   * @returns {Object} - Current worker status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      processingInterval: this.PROCESSING_INTERVAL_MS,
      maxRetries: this.maxRetries
    };
  }

  /**
   * Force immediate queue processing
   */
  async forceProcess() {
    if (!navigator.onLine) {
      console.log('📴 Cannot force process: offline');
      return {
        success: false,
        error: 'Device is offline'
      };
    }

    console.log('🚀 Force processing sync queue');
    await this.processQueue();
    return { success: true };
  }
}

// Create singleton instance
const syncWorker = new SyncWorker();

// Export singleton
export default syncWorker;
export { SyncWorker };

/**
 * Start the sync worker
 */
export const startSyncWorker = () => {
  syncWorker.start();
};

/**
 * Stop the sync worker
 */
export const stopSyncWorker = () => {
  syncWorker.stop();
};

/**
 * Get worker status
 */
export const getWorkerStatus = () => {
  return syncWorker.getStatus();
};

/**
 * Force immediate processing
 */
export const forceProcessQueue = async () => {
  return await syncWorker.forceProcess();
};

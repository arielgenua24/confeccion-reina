import './styles.css'

// eslint-disable-next-line react/prop-types
function ProductFormModal({handleSubmit, newProduct, setNewProduct, setIsModalOpen}){

    return(
        <div className="modal">
        <form onSubmit={handleSubmit} className="modalContent">
          <h3 className="subtitle">Nuevo Producto</h3>
          
          {['name', 'price', 'size', 'color', 'stock'].map(field => (
            <div key={field} className="formGroup">
              <label className="label">
                {field === 'name' ? 'Nombre del producto' : field}
              </label>
              <input
                type={field === 'price' || field === 'stock' ? 'number' : 'text'}
                value={newProduct[field]}
                onChange={(e) => setNewProduct({
                  ...newProduct,
                  [field]: e.target.value
                })}
                className="input"
                required
              />
            </div>
          ))}

          <div className="buttonGroup">
            <button type="submit" className="button">
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="button"
            >
              Salir
            </button>
          </div>
        </form>
      </div>
    )
}

export default ProductFormModal;
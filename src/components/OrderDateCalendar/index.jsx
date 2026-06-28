import { useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isBefore,
  addMonths,
  subMonths,
  differenceInCalendarDays,
  format,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "./styles.css";

const WEEKDAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

/**
 * OrderDateCalendar
 *
 * Pick a single day, or a range of up to `maxRangeDays` days.
 * Selection logic:
 *   - 1st tap  -> sets the start (single day so far).
 *   - 2nd tap  -> later day within the limit completes the range;
 *                 the same day keeps it a single day;
 *                 an earlier day restarts the selection from there.
 *
 * onConfirm(startDate, endDate) is called with both bounds (equal for one day).
 */
// eslint-disable-next-line react/prop-types
function OrderDateCalendar({ onConfirm, onCancel, maxRangeDays = 15 }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(startOfMonth(today));
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [limitWarning, setLimitWarning] = useState(false);

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 0 });
    const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewMonth]);

  const handleDayClick = (day) => {
    setLimitWarning(false);

    // Fresh selection (nothing chosen yet, or a full range already chosen).
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(day);
      setRangeEnd(null);
      return;
    }

    // A start exists, no end yet.
    if (isSameDay(day, rangeStart)) {
      // Same day tapped again -> keep it a single day.
      return;
    }

    if (isBefore(day, rangeStart)) {
      // Earlier day -> restart from there.
      setRangeStart(day);
      setRangeEnd(null);
      return;
    }

    // Later day -> try to complete the range, enforcing the max span.
    const span = differenceInCalendarDays(day, rangeStart) + 1; // inclusive
    if (span > maxRangeDays) {
      setLimitWarning(true);
      return;
    }
    setRangeEnd(day);
  };

  const isSelected = (day) => {
    if (rangeStart && rangeEnd) {
      return isWithinInterval(day, { start: rangeStart, end: rangeEnd });
    }
    return rangeStart && isSameDay(day, rangeStart);
  };

  const isEndpoint = (day) =>
    (rangeStart && isSameDay(day, rangeStart)) ||
    (rangeEnd && isSameDay(day, rangeEnd));

  const selectionLabel = () => {
    if (!rangeStart) return "Selecciona un día";
    if (!rangeEnd || isSameDay(rangeStart, rangeEnd)) {
      return format(rangeStart, "d 'de' MMMM yyyy", { locale: es });
    }
    const span = differenceInCalendarDays(rangeEnd, rangeStart) + 1;
    return `${format(rangeStart, "d MMM", { locale: es })} – ${format(
      rangeEnd,
      "d MMM yyyy",
      { locale: es }
    )} · ${span} días`;
  };

  const confirm = () => {
    if (!rangeStart) return;
    onConfirm(rangeStart, rangeEnd || rangeStart);
  };

  return (
    <div className="odc-overlay" onClick={onCancel}>
      <div className="odc-card" onClick={(e) => e.stopPropagation()}>
        <div className="odc-header">
          <span className="odc-title">¿De qué fecha es la orden?</span>
          <button className="odc-close" aria-label="Cerrar" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <div className="odc-nav">
          <button
            className="odc-nav-btn"
            aria-label="Mes anterior"
            onClick={() => setViewMonth((m) => subMonths(m, 1))}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="odc-month">
            {format(viewMonth, "MMMM yyyy", { locale: es })}
          </span>
          <button
            className="odc-nav-btn"
            aria-label="Mes siguiente"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="odc-weekdays">
          {WEEKDAYS.map((w) => (
            <span key={w} className="odc-weekday">
              {w}
            </span>
          ))}
        </div>

        <div className="odc-grid">
          {days.map((day) => {
            const inMonth = isSameMonth(day, viewMonth);
            const selected = isSelected(day);
            const endpoint = isEndpoint(day);
            const isToday = isSameDay(day, today);
            const classes = [
              "odc-day",
              inMonth ? "" : "odc-day--muted",
              selected ? "odc-day--in-range" : "",
              endpoint ? "odc-day--endpoint" : "",
              isToday ? "odc-day--today" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={day.toISOString()}
                className={classes}
                onClick={() => handleDayClick(day)}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>

        {limitWarning && (
          <p className="odc-warning">
            El rango máximo es de {maxRangeDays} días. Elige una fecha de fin más cercana.
          </p>
        )}

        <div className="odc-footer">
          <span className="odc-selection">{selectionLabel()}</span>
          <div className="odc-actions">
            <button className="odc-btn odc-btn--ghost" onClick={onCancel}>
              Cancelar
            </button>
            <button
              className="odc-btn odc-btn--primary"
              disabled={!rangeStart}
              onClick={confirm}
            >
              Buscar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDateCalendar;

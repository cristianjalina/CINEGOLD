import { formatCurrency } from '../../utils/formatters.js';
import Button from '../ui/Button.jsx';

export default function BookingSummary({ selectedSeatCount, comboTotal, total, onProceed }) {
  const disabled = total <= 0;

  return (
    <div className="mt-8 border-t border-line pt-6">
      <h3 className="text-base font-bold uppercase tracking-wider text-white">RESUMEN DE RESERVA</h3>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-cinemaMuted">Asientos elegidos:</span>
          <span className="font-bold text-white">{selectedSeatCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-cinemaMuted">Monto Combos:</span>
          <span className="font-bold text-white">{formatCurrency(comboTotal)}</span>
        </div>
      </div>
      <div className="mt-6 flex items-baseline justify-between">
        <span className="text-xl font-bold text-white">TOTAL GENERAL:</span>
        <span className="text-3xl font-bold text-gold">{formatCurrency(total)}</span>
      </div>
      <Button disabled={disabled} size="lg" className="mt-6 w-full" onClick={onProceed}>
        PROCEDER AL PAGO SEGURO
      </Button>
    </div>
  );
}

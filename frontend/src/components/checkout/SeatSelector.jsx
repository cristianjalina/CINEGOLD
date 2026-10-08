import EmptyState from '../ui/EmptyState.jsx';
import SectionTitle from '../ui/SectionTitle.jsx';

export default function SeatSelector({ seats = [], selectedSeats = [], onToggleSeat }) {
  if (!seats.length) {
    return (
      <section className="rounded-[24px] bg-surface p-8">
        <SectionTitle>2. ELIGE TUS ASIENTOS</SectionTitle>
        <div className="mt-8">
          <EmptyState
            title="No hay mapa de asientos disponible"
            message="El selector se activará cuando la API entregue asientos reales para la sala seleccionada."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] bg-surface p-8">
      <SectionTitle>2. ELIGE TUS ASIENTOS</SectionTitle>
      <div className="mb-12 mt-10 border-b-4 border-lineStrong pb-4 text-center text-xs font-bold uppercase tracking-[0.3em] text-cinemaMuted">
        PANTALLA CENTRAL
      </div>
      <div className="mx-auto grid max-w-md grid-cols-7 justify-center gap-3 sm:gap-4">
        {seats.map((seat) => {
          const selected = selectedSeats.includes(seat.idAsiento);
          const occupied = seat.estado === 'ocupado';
          return (
            <button
              key={seat.idAsiento}
              disabled={occupied}
              onClick={() => onToggleSeat(seat)}
              className={`aspect-square rounded-md ${
                occupied
                  ? 'cursor-not-allowed bg-danger/80'
                  : selected
                    ? 'bg-gold shadow-gold'
                    : 'bg-line hover:bg-gold/50'
              }`}
              aria-label={`Asiento ${seat.fila}${seat.numero}`}
            />
          );
        })}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-cinemaMuted">
        <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-sm bg-line" />Disponible</span>
        <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-sm bg-gold" />Seleccionado</span>
        <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-sm bg-danger" />Ocupado</span>
      </div>
    </section>
  );
}

import EmptyState from '../ui/EmptyState.jsx';
import SectionTitle from '../ui/SectionTitle.jsx';

export default function CandyShop({ combos = [], quantities = {}, onChangeQuantity }) {
  return (
    <section className="rounded-[24px] bg-surface p-8">
      <SectionTitle>3. AÑADE COMBOS DE DULCERÍA</SectionTitle>
      <div className="mt-8 space-y-4">
        {!combos.length ? (
          <EmptyState
            title="No hay combos disponibles"
            message="La dulcería se mostrará cuando existan combos reales disponibles en SQL Server."
          />
        ) : (
          combos.map((combo) => (
            <article key={combo.idCombo} className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-field p-5">
              <div>
                <h3 className="text-base font-bold text-white">{combo.nombreCombo}</h3>
                <p className="mt-1 text-xs text-cinemaMuted">{combo.descripcion}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-gold">{combo.precioFijo}</span>
                <div className="flex items-center rounded-full border border-line bg-surface">
                  <button className="px-3 py-2 text-gold" onClick={() => onChangeQuantity(combo, -1)}>-</button>
                  <span className="min-w-8 text-center font-bold text-white">{quantities[combo.idCombo] || 0}</span>
                  <button className="px-3 py-2 text-gold" onClick={() => onChangeQuantity(combo, 1)}>+</button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

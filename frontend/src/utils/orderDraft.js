const STORAGE_KEY = 'cinegold_order_draft';

const EMPTY_DRAFT = {
  movie: null,
  function: null,
  seats: [],
  candy: [],
};

function readDraft() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY_DRAFT, ...JSON.parse(raw) } : { ...EMPTY_DRAFT };
  } catch {
    return { ...EMPTY_DRAFT };
  }
}

function writeDraft(draft) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function getOrderDraft() {
  if (typeof window === 'undefined') return { ...EMPTY_DRAFT };
  return readDraft();
}

export function setOrderDraft(patch) {
  if (typeof window === 'undefined') return { ...EMPTY_DRAFT, ...patch };
  const next = { ...readDraft(), ...patch };
  writeDraft(next);
  return next;
}

export function clearOrderDraft() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function mergeOrderDraft(patch) {
  const current = getOrderDraft();
  const next = {
    ...current,
    ...patch,
    candy: patch.candy ?? current.candy ?? [],
    seats: patch.seats ?? current.seats ?? [],
  };
  return setOrderDraft(next);
}

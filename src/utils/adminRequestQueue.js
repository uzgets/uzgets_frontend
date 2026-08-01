/**
 * Admin panel uchun oddiy per-key navbat.
 * Bitta kalitga tegishli chaqiruvlar ketma-ket bajariladi (paralelmas).
 * Bir vaqtda kelgan bir xil signature bo'lsa — natija baham ko'riladi.
 */

const chains = new Map(); // key -> Promise (chain tail)
const inFlight = new Map(); // key+signature -> Promise (dedup)

export function runQueued(key, fn, { signature } = {}) {
  const dedupKey = signature ? `${key}::${signature}` : null;
  if (dedupKey && inFlight.has(dedupKey)) {
    return inFlight.get(dedupKey);
  }

  const previous = chains.get(key) || Promise.resolve();
  const nextChain = previous.catch(() => {}).then(() => fn());

  const cleanup = () => {
    if (chains.get(key) === settled) {
      chains.delete(key);
    }
    if (dedupKey && inFlight.get(dedupKey) === nextChain) {
      inFlight.delete(dedupKey);
    }
  };
  const settled = nextChain.then(
    (v) => {
      cleanup();
      return v;
    },
    (e) => {
      cleanup();
      throw e;
    }
  );
  chains.set(key, settled);
  if (dedupKey) inFlight.set(dedupKey, nextChain);
  return nextChain;
}

/** Nomdagi navbat bo'sh yoki yo'q bo'lsa (test/debug). */
export function isQueueIdle(key) {
  return !chains.has(key);
}

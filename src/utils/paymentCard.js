/**
 * 💳 Faol to'lov kartasi — UZCARD yoki HUMO.
 *
 * Karta admin panelda almashtiriladi va `/api/app-config` orqali keladi.
 * So'rov muvaffaqiyatsiz bo'lsa .env dagi qiymat ko'rsatiladi (eski xatti-harakat).
 */
import { useEffect, useState } from "react";
import apiFetch from "./apiFetch";

const FALLBACK_CARD = {
  cardNumber: import.meta.env.VITE_CARD_NUMBER || "",
  cardName: import.meta.env.VITE_CARD_NAME || "",
  provider: "uzcard",
  providerLabel: "UZCARD",
  loading: true,
};

export function usePaymentCard() {
  const [card, setCard] = useState(FALLBACK_CARD);

  useEffect(() => {
    let alive = true;

    apiFetch("/api/app-config")
      .then((r) => r.json())
      .then((cfg) => {
        if (!alive || !cfg?.card_number) return;
        setCard({
          cardNumber: String(cfg.card_number),
          cardName: cfg.card_name || FALLBACK_CARD.cardName,
          provider: cfg.card_provider || "uzcard",
          providerLabel: cfg.card_provider_label || "UZCARD",
          loading: false,
        });
      })
      .catch(() => {
        if (alive) setCard((c) => ({ ...c, loading: false }));
      });

    return () => {
      alive = false;
    };
  }, []);

  return card;
}

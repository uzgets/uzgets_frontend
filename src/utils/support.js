export const SUPPORT_USERNAME = "@uzgets_jbot";
export const SUPPORT_URL = "https://t.me/uzgets_jbot";

function buildExpiredMessage(productLabel) {
  return `⚠️ Siz ${productLabel} sotib olishga harakat qildingiz, ammo to'lov amalga oshirilmadi.\n\nAgar qandaydir muammo yuzaga kelgan bo'lsa, iltimos admin bilan bog'laning:\n\nAdmin: ${SUPPORT_USERNAME}`;
}

export const EXPIRED_STARS_MESSAGE = buildExpiredMessage("stars");
export const EXPIRED_PREMIUM_MESSAGE = buildExpiredMessage("premium");
export const EXPIRED_GIFT_MESSAGE = buildExpiredMessage("gift");

export function getExpiredPaymentMessage(kind) {
  if (kind === "premium") return EXPIRED_PREMIUM_MESSAGE;
  if (kind === "gift") return EXPIRED_GIFT_MESSAGE;
  return EXPIRED_STARS_MESSAGE;
}

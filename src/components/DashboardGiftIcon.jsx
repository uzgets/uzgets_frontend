import React from "react";

export default function DashboardGiftIcon({ color = "#FFDA03", size = 88 }) {
  const dark = adjustColor(color, -40);
  const light = adjustColor(color, 30);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="14" y="38" width="60" height="40" rx="8" fill={dark} />
      <rect x="14" y="30" width="60" height="14" rx="6" fill={color} />
      <rect x="40" y="30" width="8" height="48" fill={light} opacity="0.85" />
      <rect x="14" y="48" width="60" height="8" fill={light} opacity="0.7" />
      <ellipse cx="44" cy="26" rx="14" ry="8" fill={color} />
      <ellipse cx="34" cy="22" rx="10" ry="7" fill={light} />
      <ellipse cx="54" cy="22" rx="10" ry="7" fill={light} />
      <circle cx="44" cy="24" r="5" fill={dark} opacity="0.35" />
    </svg>
  );
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

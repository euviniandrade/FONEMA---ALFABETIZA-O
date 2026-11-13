// Ícones dos 12 princípios (SVG próprio, traço branco sobre círculo colorido).
window.GLIFO = {
  N1: '<path d="M2.5 12s3.6-6.5 9.5-6.5S21.5 12 21.5 12s-3.6 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  N2: '<circle cx="12" cy="12" r="2.6" fill="#fff"/><circle cx="12" cy="12" r="6"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5"/>',
  N3: '<path d="M8 8h7a4.5 4.5 0 0 1 0 9H8"/><path d="M11 4.5 7.5 8l3.5 3.5"/>',
  N4: '<path d="M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 0 0 9.5 9.5z"/><path d="M15 4h3l-3 3h3"/>',
  N5: '<rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 10h16M8 3.5v4M16 3.5v4"/><circle cx="8" cy="14" r="1" fill="#fff"/><circle cx="16" cy="16.5" r="1" fill="#fff"/>',
  N6: '<path d="M5 14.5v4.5h14v-4.5"/><path d="M12 16V5"/><path d="M8 9l4-4 4 4"/>',
  N7: '<path d="M3.5 7h4l9 10h4M3.5 17h4l9-10h4"/><path d="M18 4.5l2.5 2.5-2.5 2.5M18 14.5l2.5 2.5-2.5 2.5"/>',
  N8: '<circle cx="9" cy="9.5" r="4.5"/><circle cx="15" cy="9.5" r="4.5"/><circle cx="12" cy="14.5" r="4.5"/>',
  N9: '<rect x="2.8" y="8.5" width="10" height="7" rx="3.5"/><rect x="11.2" y="8.5" width="10" height="7" rx="3.5"/>',
  N10: '<path d="M9 9a3 3 0 1 1 4.2 2.8c-.8.4-1.2 1-1.2 1.9V15"/><circle cx="12" cy="18.3" r="1" fill="#fff"/>',
  N11: '<path d="M12 4 3.5 8.5 12 13l8.5-4.5z"/><path d="M3.5 13 12 17.5l8.5-4.5"/>',
  N12: '<path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
};
window.icone = function (id, s, cor) {
  const p = (window.PRINC || []).find(x => x.id === id);
  const c = cor || (p ? p.cor : '#555');
  return `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="${c}"/><g transform="translate(2.4 2.4) scale(.8)" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${window.GLIFO[id]}</g></svg>`;
};
window.P = id => window.PRINC.find(x => x.id === id);

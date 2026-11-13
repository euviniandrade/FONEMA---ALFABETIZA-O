// Ícones SVG simples (traço arredondado), preenchidos em elementos com data-ic.
const IC={
 som:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6"/><path d="M18.3 6.3a8 8 0 0 1 0 11.4"/></svg>',
 voltar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
 seguir:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7"/></svg>',
 girae:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M6.5 2.8v4.2h4.2"/></svg>',
 girad:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M17.5 2.8v4.2h-4.2"/></svg>',
 ok:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
 cadeado:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
 mao:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4 14.5a1.5 1.5 0 0 1 2.4-1.8L9 15"/></svg>',
 coracao:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.9c0 5.4-7.5 10-7.5 10z"/></svg>',
 casa:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11L12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/></svg>',
 escudo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7.5 3v5.5c0 4.7-3.2 8-7.5 9.5-4.3-1.5-7.5-4.8-7.5-9.5V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>',
 x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 olho:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
 porco:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9.5c.6-1.3 1.6-2 2.5-2-.2 1-.6 1.8-1 2.4.6.8 1 1.7 1 2.6V15h-1.6a7 7 0 0 1-2.4 2.6V20h-2.8v-1.6a8 8 0 0 1-3.4 0V20H8.5v-2.4A6.4 6.4 0 0 1 5 12c0-3.6 3.4-6.5 7.5-6.5 2.7 0 5.1 1.6 6.5 4z"/></svg>',
};
document.querySelectorAll('[data-ic]').forEach(e=>{e.innerHTML=IC[e.dataset.ic]||'';});

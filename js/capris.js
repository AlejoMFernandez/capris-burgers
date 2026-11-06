// Capri's Burgers · demo · Alejo Martín Fernández
import { initKit } from '../kit/kit.js?v=1';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = matchMedia('(min-width: 900px)');

// =========================================================
// INTRO · la bandera de largada
// =========================================================
$$('.hero .linea > span').forEach((s, i) => s.parentElement.style.setProperty('--i', i));
function terminarIntro() { html.classList.remove('con-intro'); document.body.classList.add('listo'); html.classList.add('listo'); }
if (html.classList.contains('con-intro')) {
  const intro = $('.intro');
  const k = desktop.matches ? 1 : 0.76;               // celu más corto
  const heroImg = $('.hero .arco img');
  const listo = Promise.all([
    document.fonts?.ready || Promise.resolve(),
    heroImg.complete ? Promise.resolve() : new Promise(r => { heroImg.addEventListener('load', r, { once: true }); heroImg.addEventListener('error', r, { once: true }); }),
  ]);
  const minimo = new Promise(r => setTimeout(r, 1000 * k));
  const tope = new Promise(r => setTimeout(r, 2600));
  Promise.race([Promise.all([listo, minimo]), tope]).then(() => {
    intro.classList.add('va');
    setTimeout(() => intro.classList.add('sube'), 520 * k);
    setTimeout(() => { terminarIntro(); intro.remove(); }, 1100 * k);
  });
} else terminarIntro();

// =========================================================
// ENTRADAS AL SCROLL
// =========================================================
$$('.obra__c').forEach((c, i) => c.style.setProperty('--i', i));
$$('.pasos .paso').forEach((c, i) => c.style.setProperty('--d', `${i * 0.09}s`));
$$('.socios .socio').forEach((c, i) => c.style.setProperty('--d', `${i * 0.09}s`));
$$('.gal__f').forEach((c, i) => c.style.setProperty('--d', `${(i % 4) * 0.06}s`));
const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
$$('.rv, .neon, .obra__pista').forEach(el => io.observe(el));

// =========================================================
// BARRA Y MENÚ
// =========================================================
const top = $('#top');
let ticking = false;
addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { top.classList.toggle('is-scroll', scrollY > 8); ticking = false; }); }, { passive: true });
const menu = $('#menu-m'), bMenu = $('.top__menu');
let scrollGuardado = 0;
function abrirMenu(si) {
  menu.hidden = !si; bMenu.setAttribute('aria-expanded', si); bMenu.setAttribute('aria-label', si ? 'Cerrar menú' : 'Abrir menú');
  document.body.classList.toggle('menu-abierto', si);
  bMenu.innerHTML = si ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  if (si) { scrollGuardado = scrollY; document.body.style.cssText = `position:fixed;top:-${scrollGuardado}px;left:0;right:0`; }
  else { document.body.style.cssText = ''; scrollTo({ top: scrollGuardado, behavior: 'instant' }); }
}
bMenu.addEventListener('click', () => abrirMenu(menu.hidden));
menu.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); abrirMenu(false); const t = $(a.getAttribute('href')); t && t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) abrirMenu(false); });
desktop.addEventListener('change', () => { if (desktop.matches && !menu.hidden) abrirMenu(false); });

// toast
const toastEl = $('.toast'); let tT;
function toast(msg) { toastEl.textContent = msg; toastEl.hidden = false; toastEl.style.animation = 'none'; void toastEl.offsetWidth; toastEl.style.animation = ''; clearTimeout(tT); tT = setTimeout(() => { toastEl.hidden = true; }, 2400); }

// =========================================================
// CARTA (templates del kit)
// =========================================================
const SIGNO_P = { 'capri-cheeseburger': '♑︎', 'apple-bacon': '♒︎' };
const ETIQ = {
  casa: { label: 'La de la casa' },
  picante: { label: 'Picante' },
};
function tags(p, ctx) { return (p.etiquetas || []).map(t => ctx.etiquetaHTML(t)).join(''); }
function tplBurger(p, ctx) {
  const vs = (p.variantes || []).filter(v => v && v.precio != null);
  const pedible = ctx.pedible(p) && vs.length;
  const ps = pedible
    ? vs.map(v => `<button type="button" class="pb" data-pb="${esc(p.id)}" data-var="${esc(v.id)}" aria-label="Sumar ${esc(p.nombre)} ${esc(v.nombre.toLowerCase())}, ${esc(ctx.money(v.precio))}"><span class="pb__t">${esc(v.nombre)}</span><span class="pb__m">${esc(ctx.money(v.precio))}</span><i class="pb__n" hidden></i></button>`).join('')
    : `<span class="ot__p">Consultar</span>`;
  return `<div class="bg">
    <div class="bg__top">${p.foto ? `<img class="bg__img" src="${esc(ctx.asset(p.foto))}" width="600" height="600" alt="" loading="lazy" decoding="async">` : ''}
      <div><h4 class="bg__n">${esc(p.nombre)} ${SIGNO_P[p.id] ? `<span class="bg__s" aria-hidden="true">${SIGNO_P[p.id]}</span>` : ''}${tags(p, ctx)}</h4>${p.descripcion ? `<p class="bg__d">${esc(p.descripcion)}</p>` : ''}</div>
    </div>
    <div class="bg__ps">${ps}</div></div>`;
}
function tplOtro(p, ctx) {
  const precio = ctx.money(p.precio);
  return `<div class="ot"><div class="ot__b"><h4 class="ot__n">${esc(p.nombre)}${tags(p, ctx)}</h4>${p.descripcion ? `<p class="ot__d">${esc(p.descripcion)}</p>` : ''}<span class="ot__p">${precio ? esc(precio) : 'Consultar'}</span></div>
    ${ctx.pedible(p) && precio ? `<div data-kit-qty="${esc(p.id)}"></div>` : ''}</div>`;
}

const productos = new Map();
const pendientes = []; let alCarta = null;
document.addEventListener('kit:carta', (e) => { alCarta ? alCarta(e) : pendientes.push(e); });

const otro = { itemClass: 'ot-it', template: tplOtro, etiquetas: ETIQ };
const kit = await initKit({
  config: 'cliente.json',
  imagenes: { lqip: 'img/lqip.json' },
  cartas: {
    'carta-burgers': { itemClass: 'bg-it', template: tplBurger, etiquetas: ETIQ },
    'carta-sides': otro, 'carta-drinks': otro, 'carta-dips': otro,
  },
  carrito: { label: 'Tu bandeja' },
  badgeTexto: 'Probá el panel del local',
});
window.kitCapris = kit;
const money = (n) => kit.money(n);

alCarta = (e) => {
  (e.detail.productos || []).forEach(p => productos.set(p.id, p));
  if (e.detail.el?.id === 'carta-burgers') { pintarPB(); pintarPrecios(); rueda.refrescar(); fotoPorDefecto(); }
};
pendientes.splice(0).forEach(alCarta);

// precios del hero desde la carta guardada
function pintarPrecios() {
  $$('[data-precio-desde]').forEach(el => {
    const p = productos.get(el.dataset.precioDesde); const v = p?.variantes?.find(x => x.precio != null);
    if (v) el.textContent = `Desde ${money(v.precio)}`;
  });
}

// botones de precio por tamaño
const veggie = $('[data-veggie]');
const opcVeggie = () => (veggie?.checked ? { carne: 'veggie' } : undefined);
$('#carta-burgers').addEventListener('click', (e) => {
  const b = e.target.closest('[data-pb]'); if (!b) return;
  const p = productos.get(b.dataset.pb); if (!p) return;
  const v = p.variantes.find(x => x.id === b.dataset.var);
  kit.carrito.agregar(p.id, 1, { variante: b.dataset.var, opc: opcVeggie(), origen: b });
  b.querySelector('.pb__n')?.classList.remove('bump'); void b.offsetWidth; b.querySelector('.pb__n')?.classList.add('bump');
  toast(`Sumaste ${p.nombre} ${v ? v.nombre.toLowerCase() : ''}${veggie?.checked ? ' veggie' : ''}`);
});
function pintarPB() {
  const n = {};
  (kit.carrito.lineas || []).forEach(l => { const k = `${l.id}|${l.variante || ''}`; n[k] = (n[k] || 0) + l.cant; });
  $$('[data-pb]').forEach(b => {
    const c = n[`${b.dataset.pb}|${b.dataset.var}`] || 0; const i = b.querySelector('.pb__n');
    b.classList.toggle('tiene', c > 0); i.hidden = !c; i.textContent = c;
  });
}
// contador de la barra
const topN = $('.top__n');
function pintarContador(bump) {
  const n = (kit.carrito.lineas || []).reduce((s, l) => s + l.cant, 0);
  topN.hidden = !n; topN.textContent = n;
  if (bump && n) { topN.classList.remove('bump'); void topN.offsetWidth; topN.classList.add('bump'); }
}
document.addEventListener('kit:carrito', (e) => { pintarPB(); pintarContador((e.detail?.delta || 0) > 0); });
kit.carrito.listo?.then(() => { pintarPB(); pintarContador(); });

// foto fija al costado (desktop)
const cFoto = $('[data-cfoto]'), cFotoN = $('[data-cfoto-n]');
let fotoActual = '';
function mostrarFoto(id) {
  const p = productos.get(id); if (!p?.foto || !cFoto) return;
  const src = kit.asset ? kit.asset(p.foto) : p.foto;
  cFotoN.textContent = p.nombre;
  if (fotoActual === src) return; fotoActual = src;
  cFoto.classList.add('cambia');
  const img = new Image(); img.onload = () => { cFoto.src = src; cFoto.classList.remove('cambia'); }; img.src = src;
}
function fotoPorDefecto() { const it = $('#carta-burgers .kit-item'); if (it) mostrarFoto(it.dataset.id); }
let rafHover = 0;
$('#carta-burgers').addEventListener('pointerover', (e) => {
  if (e.pointerType !== 'mouse') return;
  const it = e.target.closest('.kit-item'); if (!it) return;
  cancelAnimationFrame(rafHover); rafHover = requestAnimationFrame(() => mostrarFoto(it.dataset.id));
});

// pestañas de la carta (celu)
const tabs = $$('.ctab');
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => { const on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on); });
  $$('[data-grupo]').forEach(g => g.classList.toggle('is-on', g.dataset.grupo === t.dataset.g));
  t.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  const sec = $('#carta .sec-cab'); const y = sec.getBoundingClientRect().bottom;
  if (y < 0) $('.carta__tabs').scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
}));

// =========================================================
// LA RUEDA CAPRI
// =========================================================
const SIGNOS = [
  ['aries', '♈︎', 'Aries', 'fuego'], ['tauro', '♉︎', 'Tauro', 'tierra'], ['geminis', '♊︎', 'Géminis', 'aire'],
  ['cancer', '♋︎', 'Cáncer', 'agua'], ['leo', '♌︎', 'Leo', 'fuego'], ['virgo', '♍︎', 'Virgo', 'tierra'],
  ['libra', '♎︎', 'Libra', 'aire'], ['escorpio', '♏︎', 'Escorpio', 'agua'], ['sagitario', '♐︎', 'Sagitario', 'fuego'],
  ['capricornio', '♑︎', 'Capricornio', 'tierra'], ['acuario', '♒︎', 'Acuario', 'aire'], ['piscis', '♓︎', 'Piscis', 'agua'],
];
const ELEM = {
  tierra: { id: 'capri-cheeseburger', desc: 'La de Lucho, capricorniano: pepinillos y salsa Capri.' },
  aire: { id: 'apple-bacon', desc: 'La de Sol, acuariana: manzana caramelizada y bacon.' },
  fuego: { id: 'mustard-chili', desc: 'Mostaza y fried jalapeños, para los que arden.' },
  agua: { id: 'capri-cheeseburger', veggie: true, desc: 'La Capri con medallón veggie, pepinillos y salsa Capri.' },
};
const rueda = (() => {
  const R = $('[data-rueda]'), aro = $('[data-aro]');
  const inv = $('[data-rc-inv]'), bur = $('[data-rc-burger]');
  const fFoto = $('[data-rc-foto]'), fSig = $('[data-rc-signo]'), fNom = $('[data-rc-nombre]'), fDesc = $('[data-rc-desc]'), fPrecio = $('[data-rc-precio]');
  const sumar = $$('[data-rc-sumar]'), tamBoxes = $$('[data-tam]');
  let rot = 0, sel = null, tam = 'doble', auto = !reduce, enVista = false;
  aro.innerHTML = SIGNOS.map(([id, g, n], k) => `<button type="button" class="signo" data-k="${k}" style="--a:${k * 30}deg" aria-label="${n}" aria-pressed="false"><span class="signo__in"><span class="signo__g" aria-hidden="true">${g}</span><span class="signo__n" aria-hidden="true">${n}</span></span></button>`).join('');
  const btns = $$('.signo', aro);
  const setRot = (r) => { rot = r; R.style.setProperty('--rot', `${rot}deg`); };
  const kArriba = () => ((Math.round(-rot / 30) % 12) + 12) % 12;

  function info() {
    if (sel == null) return null;
    const [, g, n, el] = SIGNOS[sel]; const E = ELEM[el]; const p = productos.get(E.id);
    return { g, n, el, E, p };
  }
  function pintarTam(p) {
    const vs = (p?.variantes || []).filter(v => v.precio != null);
    if (!vs.some(v => v.id === tam)) tam = vs[1]?.id || vs[0]?.id || '';
    tamBoxes.forEach(box => {
      box.innerHTML = vs.map(v => `<button type="button" class="tam" role="radio" aria-checked="${v.id === tam}" data-v="${esc(v.id)}">${esc(v.nombre)}${box.closest('.rueda__bandeja') ? `<small>${esc(money(v.precio))}</small>` : ''}</button>`).join('');
    });
    const v = vs.find(x => x.id === tam);
    fPrecio.textContent = v ? money(v.precio) : 'Consultar';
    sumar.forEach(b => { b.disabled = !v; });
  }
  function pintar(animar) {
    btns.forEach((b, k) => { const on = k === sel; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    const i = info();
    if (!i) { inv.hidden = false; bur.hidden = true; sumar.forEach(b => { b.disabled = true; }); tamBoxes.forEach(b => { b.innerHTML = ['Simple', 'Doble', 'Triple'].map(t => `<button type="button" class="tam" role="radio" aria-checked="false" disabled>${t}</button>`).join(''); }); return; }
    inv.hidden = true; bur.hidden = false;
    fSig.textContent = `${i.g} ${i.n} · ${i.el}`;
    fNom.textContent = i.p ? i.p.nombre + (i.E.veggie ? ' veggie' : '') : '…';
    fDesc.textContent = i.E.desc;
    if (i.p?.foto) { const src = kit.asset ? kit.asset(i.p.foto) : i.p.foto; if (fFoto.getAttribute('src') !== src) fFoto.src = src; fFoto.alt = i.p.nombre; }
    pintarTam(i.p);
    if (animar && !reduce) { bur.classList.remove('pop'); void bur.offsetWidth; bur.classList.add('pop'); }
  }
  function elegir(k, animar = true) { const nuevo = sel !== k; sel = k; pintar(animar && nuevo); }
  function irA(k) {
    auto = false;
    const d = -k * 30; const target = d + 360 * Math.round((rot - d) / 360);
    R.classList.add('gira'); setRot(target);
    setTimeout(() => R.classList.remove('gira'), 650);
    elegir(k);
  }
  // arrastre con dedo o mouse
  let drag = null;
  const ang = (e) => { const r = R.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
  aro.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    auto = false; R.classList.remove('gira');
    drag = { a0: ang(e), r0: rot, x: e.clientX, y: e.clientY, movio: false, sig: e.target.closest('.signo'), last: ang(e), t: performance.now(), v: 0 };
    aro.setPointerCapture(e.pointerId);
  });
  aro.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (!drag.movio && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) { drag.movio = true; R.classList.add('arrastrando'); }
    if (!drag.movio) return;
    const a = ang(e); let d = a - drag.last; if (d > 180) d -= 360; if (d < -180) d += 360;
    const now = performance.now(); drag.v = d / Math.max(1, now - drag.t); drag.t = now; drag.last = a;
    setRot(rot + d);
    const k = kArriba(); if (k !== sel) elegir(k, false);
  });
  const soltar = (e) => {
    if (!drag) return;
    const d = drag; drag = null; R.classList.remove('arrastrando');
    if (!d.movio) { if (d.sig) irA(Number(d.sig.dataset.k)); return; }
    const objetivo = rot + Math.max(-90, Math.min(90, d.v * 160));
    const k = ((Math.round(-objetivo / 30) % 12) + 12) % 12;
    irA(k);
  };
  aro.addEventListener('pointerup', soltar);
  aro.addEventListener('pointercancel', soltar);
  // teclado (los signos son botones)
  aro.addEventListener('click', (e) => { if (e.detail !== 0) return; const b = e.target.closest('.signo'); if (b) irA(Number(b.dataset.k)); });
  aro.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return; e.preventDefault();
    const k = ((sel ?? kArriba()) + (e.key === 'ArrowRight' ? 1 : -1) + 12) % 12; irA(k); btns[k].focus();
  });
  // tamaño y sumar
  tamBoxes.forEach(box => box.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (!b) return; tam = b.dataset.v; pintarTam(info()?.p); }));
  sumar.forEach(b => b.addEventListener('click', () => {
    const i = info(); if (!i?.p) return;
    kit.carrito.agregar(i.p.id, 1, { variante: tam, opc: i.E.veggie ? { carne: 'veggie' } : undefined, origen: b });
    const v = i.p.variantes.find(x => x.id === tam);
    toast(`${i.g} Sumaste ${i.p.nombre}${i.E.veggie ? ' veggie' : ''} ${v ? v.nombre.toLowerCase() : ''}`);
  }));
  // giro solo al principio, mientras se ve
  new IntersectionObserver((es) => { enVista = es[0].isIntersecting; }, { threshold: 0.3 }).observe(R);
  function loop() { if (auto && enVista && !document.hidden) setRot(rot - 0.12); if (auto) requestAnimationFrame(loop); }
  if (auto) requestAnimationFrame(loop);
  pintar(false);
  return { refrescar: () => pintar(false), irA };
})();

// =========================================================
// OBRA: pista que se arrastra con el mouse
// =========================================================
const pista = $('[data-pista]');
(() => {
  let d = null;
  pista.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button) return; d = { x: e.clientX, s: pista.scrollLeft, m: false }; });
  addEventListener('pointermove', (e) => { if (!d) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 4) { d.m = true; pista.classList.add('arrastra'); } if (d.m) pista.scrollLeft = d.s - dx; });
  addEventListener('pointerup', () => { if (!d) return; const m = d.m; d = null; if (m) { pista.classList.remove('arrastra'); const c = $('.obra__c', pista); const w = c.getBoundingClientRect().width + 24; pista.scrollTo({ left: Math.round(pista.scrollLeft / w) * w, behavior: 'smooth' }); } });
  const [bp, bn] = $$('[data-pista-mover]');
  const paso = () => ($('.obra__c', pista).getBoundingClientRect().width + 24) * 2;
  bp?.addEventListener('click', () => pista.scrollBy({ left: -paso(), behavior: 'smooth' }));
  bn?.addEventListener('click', () => pista.scrollBy({ left: paso(), behavior: 'smooth' }));
  const flechas = () => { if (!bp) return; bp.disabled = pista.scrollLeft < 8; bn.disabled = pista.scrollLeft + pista.clientWidth > pista.scrollWidth - 8; };
  pista.addEventListener('scroll', () => requestAnimationFrame(flechas), { passive: true }); flechas();
})();


// =========================================================
// CONFIRMACIÓN PROPIA: el ticket "Retirá acá"
// =========================================================
const tkM = $('#ticket');
let tkScroll = 0;
function cerrarTicket() { tkM.hidden = true; document.body.style.cssText = ''; scrollTo({ top: tkScroll, behavior: 'instant' }); }
tkM.addEventListener('click', (e) => { if (e.target.closest('[data-tk-cerrar]')) cerrarTicket(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !tkM.hidden) cerrarTicket(); });
document.addEventListener('kit:exito', (e) => {
  const d = e.detail || {}; if (d.tipo !== 'ok') return;
  e.preventDefault();
  const ped = d.pedido || {}; const cod = d.codigo || ped.codigo || '';
  $('[data-tk-cod]').textContent = cod ? `#${String(cod).split('-').pop()}` : '¡Listo!';
  const nombre = ped.nombre || ped.cliente?.nombre || '';
  const hora = ped.retiro?.franja?.id === 'asap' ? 'lo antes posible' : (ped.retiro?.franja?.desde ? `a las ${ped.retiro.franja.desde} hs` : '');
  $('[data-tk-sub]').textContent = [nombre, d.estado === 'aprobado' ? 'pago aprobado' : '', hora ? `retirás ${hora}` : ''].filter(Boolean).join(' · ') || 'Te esperamos en el mostrador';
  const items = (ped.items || []).map(i => `${i.cant} × ${i.nombre}${i.detalle ? ` (${i.detalle})` : ''}`);
  $('[data-tk-msg]').textContent = [`Pedido ${cod}${nombre ? ' · ' + nombre : ''}`, ...items, ped.total != null ? `Total ${money(ped.total)}` : ''].filter(Boolean).join('\n');
  const wa = $('[data-tk-wa]'); wa.hidden = !d.waUrl; if (d.waUrl) wa.href = d.waUrl;
  tkScroll = scrollY; document.body.style.cssText = `position:fixed;top:-${tkScroll}px;left:0;right:0`;
  tkM.hidden = false; $('.tk__x', tkM).focus();
});

// =========================================================
// ABIERTO / CERRADO
// =========================================================
try {
  const st = kit.abierto?.(); const el = $('[data-estado]');
  if (st && el) { const ab = typeof st === 'object' ? st.abierto : !!st; el.textContent = ab ? `Abierto ahora · hasta las ${st.cierra} hs` : (st.abre ? `Cerrado · hoy abrimos a las ${st.abre} hs` : 'Cerrado ahora'); el.classList.toggle('abierto', ab); }
} catch (_) { /* sin estado */ }

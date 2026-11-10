// Capri's Burgers · demo v2 · Alejo Martín Fernández
import { initKit } from '../kit/kit.js?v=1';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = matchMedia('(min-width: 900px)');
const mouse = matchMedia('(hover: hover) and (pointer: fine)').matches;
const reiniciar = (el, c) => { if (!el) return; el.classList.remove(c); void el.offsetWidth; el.classList.add(c); };

// =========================================================
// INTRO · telón azul que sube con borde curvo
// =========================================================
$$('.hero .linea > span').forEach((s, i) => s.parentElement.style.setProperty('--i', i));
function terminarIntro() { html.classList.remove('con-intro'); document.body.classList.add('listo'); }
if (html.classList.contains('con-intro')) {
  const intro = $('.intro');
  const k = desktop.matches ? 1 : 0.75;
  const heroImg = $('.hero .arco img');
  const cargado = Promise.all([
    document.fonts?.ready || Promise.resolve(),
    heroImg.complete ? Promise.resolve() : new Promise(r => { heroImg.addEventListener('load', r, { once: true }); heroImg.addEventListener('error', r, { once: true }); }),
  ]);
  const minimo = new Promise(r => setTimeout(r, 1250 * k));
  const tope = new Promise(r => setTimeout(r, 3000));
  Promise.race([Promise.all([cargado, minimo]), tope]).then(() => {
    intro.classList.add('sale');
    setTimeout(() => document.body.classList.add('listo'), 380 * k);
    setTimeout(() => { html.classList.remove('con-intro'); intro.remove(); }, 1050);
  });
} else terminarIntro();

// =========================================================
// ENTRADAS AL SCROLL
// =========================================================
$$('.pasos .paso').forEach((c, i) => c.style.setProperty('--d', `${i * 0.09}s`));
$$('.socios .socio').forEach((c, i) => c.style.setProperty('--d', `${i * 0.09}s`));
$$('.gal__f').forEach((c, i) => c.style.setProperty('--d', `${(i % 4) * 0.06}s`));
$$('.reel').forEach((c, i) => c.style.setProperty('--i', Math.min(i, 5)));
const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
$$('.rv, .obra__pista').forEach(el => io.observe(el));

// curvas: se aplanan a medida que la sección entra
const curvas = $$('[data-curva]');
let rafC = 0;
function pintarCurvas() {
  rafC = 0; const h = innerHeight;
  curvas.forEach(c => {
    const y = c.parentElement.getBoundingClientRect().top;
    const p = Math.min(1, Math.max(0, (h - y) / (h * 0.75)));
    c.style.setProperty('--k', (1 - p).toFixed(3));
  });
}
if (!reduce) { addEventListener('scroll', () => { if (!rafC) rafC = requestAnimationFrame(pintarCurvas); }, { passive: true }); addEventListener('resize', pintarCurvas); pintarCurvas(); }

// =========================================================
// CURSOR Y BOTONES MAGNÉTICOS (solo mouse)
// =========================================================
if (mouse && !reduce) {
  const cur = $('.cursor'), curT = $('.cursor__t');
  let x = -100, y = -100, cx = -100, cy = -100, rafCur = 0;
  const mover = () => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; rafCur = Math.hypot(x - cx, y - cy) > 0.3 ? requestAnimationFrame(mover) : 0; };
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; x = e.clientX; y = e.clientY; cur.classList.remove('oculto'); if (!rafCur) rafCur = requestAnimationFrame(mover); }, { passive: true });
  document.addEventListener('pointerleave', () => cur.classList.add('oculto'));
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cur]');
    if (t) { curT.textContent = t.dataset.cur; cur.classList.add('grande'); }
    else cur.classList.remove('grande');
    cur.classList.toggle('oculto', !!e.target.closest('a:not([data-cur]), button:not([data-cur]), input, label, .kit-qty, .kit-drawer, .kit-modal'));
  });
  $$('.mag').forEach(b => {
    const f = b.classList.contains('flecha') || b.classList.contains('top__cta') ? 0.3 : 0.22;
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      b.style.transition = 'transform .25s cubic-bezier(.22,1,.36,1)';
      b.style.transform = `translate(${dx * f}px, ${dy * f * 1.2}px)`;
      const s = b.firstElementChild; if (s) s.style.transform = `translate(${dx * f * 0.4}px, ${dy * f * 0.4}px)`;
    });
    b.addEventListener('pointerleave', () => {
      b.style.transition = 'transform .8s cubic-bezier(.34,1.56,.64,1)'; b.style.transform = '';
      const s = b.firstElementChild; if (s) s.style.transform = '';
    });
  });
}

// =========================================================
// BARRA Y MENÚ
// =========================================================
const top = $('#top');
let ticking = false;
addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { top.classList.toggle('is-scroll', scrollY > 8); ticking = false; }); }, { passive: true });
const menu = $('#menu-m'), bMenu = $('.top__menu');
let scrollGuardado = 0, menuAbierto = false, tMenu;
function abrirMenu(si) {
  menuAbierto = si; clearTimeout(tMenu);
  bMenu.setAttribute('aria-expanded', si); bMenu.setAttribute('aria-label', si ? 'Cerrar menú' : 'Abrir menú');
  document.body.classList.toggle('menu-abierto', si);
  bMenu.innerHTML = si ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  if (si) {
    menu.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('abierto')));
    scrollGuardado = scrollY; document.body.style.cssText = `position:fixed;top:-${scrollGuardado}px;left:0;right:0`;
  } else {
    menu.classList.remove('abierto'); tMenu = setTimeout(() => { menu.hidden = true; }, reduce ? 0 : 700);
    document.body.style.cssText = ''; scrollTo({ top: scrollGuardado, behavior: 'instant' });
  }
}
bMenu.addEventListener('click', () => abrirMenu(!menuAbierto));
menu.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); abrirMenu(false); const t = $(a.getAttribute('href')); t && setTimeout(() => t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }), 30); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuAbierto) abrirMenu(false); });
desktop.addEventListener('change', () => { if (desktop.matches && menuAbierto) abrirMenu(false); });

// toast
const toastEl = $('.toast'); let tT;
function toast(msg) { toastEl.textContent = msg; toastEl.hidden = false; toastEl.style.animation = 'none'; void toastEl.offsetWidth; toastEl.style.animation = ''; clearTimeout(tT); tT = setTimeout(() => { toastEl.hidden = true; }, 2400); }

// =========================================================
// CARTA VISUAL (templates del kit)
// =========================================================
const AUTOR = {
  'capri-cheeseburger': { quien: 'Lucho', signo: '♑︎', top: ['salsa', 'pepi', 'cebo', 'pepi'] },
  'apple-bacon': { quien: 'Sol', signo: '♒︎', top: ['manz', 'bacon', 'manz'] },
  'mustard-chili': { quien: 'Facu', signo: '♈︎', extra: 'pica 2/5', top: ['must', 'jala', 'cebo', 'jala'] },
};
const ORDEN = ['capri-cheeseburger', 'apple-bacon', 'mustard-chili'];
const TAM = { simple: 1, doble: 2, triple: 3 };
const corto = (d) => { let s = String(d || '').replace(/^pan de papa,\s*carne smash,\s*/i, ''); s = s.charAt(0).toUpperCase() + s.slice(1); return s ? s.replace(/\.$/, '') + ', en pan de papa.' : ''; };
const dots = (n) => `<span class="dots" aria-hidden="true">${'<i></i>'.repeat(n)}</span>`;
const varSel = new Map();        // tamaño elegido por tarjeta
const productos = new Map();

function tplBurger(p, ctx) {
  const vs = (p.variantes || []).filter(v => v && v.precio != null);
  const a = AUTOR[p.id];
  let sel = varSel.get(p.id); if (!vs.some(v => v.id === sel)) { sel = vs.find(v => v.id === 'doble')?.id || vs[0]?.id; varSel.set(p.id, sel); }
  const i = Math.max(0, vs.findIndex(v => v.id === sel));
  const pedible = ctx.pedible(p) && vs.length;
  return `<div class="bc">
    <div class="bc__ph">${p.foto ? `<img src="${esc(ctx.asset(p.foto))}" width="600" height="450" alt="${esc(p.nombre)}" loading="lazy" decoding="async">` : ''}${a ? `<span class="bc__chip">de ${a.quien} ${a.signo}${a.extra ? ' · ' + a.extra : ''}</span>` : ''}</div>
    <div class="bc__tx"><h3 class="bc__n">${esc(p.nombre.replace(/ burger$/i, ''))}</h3>${p.descripcion ? `<p class="bc__d">${esc(corto(p.descripcion))}</p>` : ''}</div>
    ${pedible ? `<div class="bc__pie">
      <div class="seg" role="radiogroup" aria-label="Tamaño de ${esc(p.nombre)}" style="--i:${i}"><span class="seg__pill" aria-hidden="true"></span>
        ${vs.map((v, k) => `<button type="button" class="seg__b" role="radio" aria-checked="${v.id === sel}" data-seg="${esc(v.id)}" aria-label="${esc(v.nombre)}, ${esc(ctx.money(v.precio))}"><span class="seg__t">${esc(v.nombre)}</span><span class="seg__p">${esc(ctx.money(v.precio))}</span></button>`).join('')}
      </div>
      <span class="bc__pw"><button type="button" class="bc__add" data-bc-add aria-label="Sumar ${esc(p.nombre)} ${esc((vs[i]?.nombre || '').toLowerCase())}"><span class="bc__add-t">Sumar · ${esc((vs[i]?.nombre || '').toLowerCase())}</span><span class="bc__add-i" aria-hidden="true">+</span></button><i class="bc__q" hidden></i></span>
    </div>` : `<p class="mi__p">Consultar</p>`}
  </div>`;
}
const INI = { agua: 'H₂O', stella: 'SA', 'capri-dip-xl': 'XL' };
function tplMini(p, ctx) {
  const precio = ctx.money(p.precio);
  return `<div class="mi"><span class="mi__th" aria-hidden="true">${p.foto ? `<img src="${esc(ctx.asset(p.foto))}" width="120" height="120" alt="" loading="lazy" decoding="async">` : esc(INI[p.id] || p.nombre.charAt(0))}</span>
    <div class="mi__b"><p class="mi__n">${esc(p.nombre)}</p>${p.descripcion ? `<p class="mi__d">${esc(p.descripcion.replace(/\.$/, ''))}</p>` : ''}<p class="mi__p">${precio ? esc(precio) : 'Consultar'}</p></div>
    ${ctx.pedible(p) && precio ? `<div class="kit-qty" data-kit-qty="${esc(p.id)}"></div>` : ''}</div>`;
}

const pendientes = []; let alCarta = null;
document.addEventListener('kit:carta', (e) => { alCarta ? alCarta(e) : pendientes.push(e); });
const ETIQ = { casa: { label: 'La de la casa' }, picante: { label: 'Picante' } };
const mini = { itemClass: 'mi-it', template: tplMini, etiquetas: ETIQ };
const kit = await initKit({
  config: 'cliente.json',
  imagenes: { lqip: 'img/lqip.json' },
  cartas: {
    'carta-burgers': { itemClass: 'bc-it', template: tplBurger, etiquetas: ETIQ },
    'carta-sides': mini, 'carta-drinks': mini, 'carta-dips': mini,
  },
  carrito: { label: 'Tu bandeja' },
  badgeTexto: 'Probá el panel del local',
});
window.kitCapris = kit;
const money = (n) => kit.money(n);
const asset = (f) => (kit.asset ? kit.asset(f) : f);

alCarta = (e) => {
  (e.detail.productos || []).forEach(p => productos.set(p.id, p));
  if (e.detail.el?.id === 'carta-burgers') { pintarBadges(); pintarPrecios(); armarDots(); smash.refrescar(); }
};

// precio del sello del hero desde la carta guardada
function pintarPrecios() {
  $$('[data-precio-desde]').forEach(el => {
    const p = productos.get(el.dataset.precioDesde); const v = p?.variantes?.find(x => x.precio != null);
    if (v) el.textContent = `Desde ${money(v.precio)}`;
  });
}

const veggie = $('[data-veggie]');
const opcVeggie = () => (veggie?.checked ? { carne: 'veggie' } : undefined);
veggie?.addEventListener('change', () => { toast(veggie.checked ? 'Listo: las burgers van con medallón veggie' : 'Volvimos a la carne smash'); smash.refrescar(); });

// tarjetas: tamaño y sumar
const cartaB = $('#carta-burgers');
cartaB.addEventListener('click', (e) => {
  const it = e.target.closest('.kit-item'); if (!it) return;
  const p = productos.get(it.dataset.id); if (!p) return;
  const sb = e.target.closest('[data-seg]');
  if (sb) {
    varSel.set(p.id, sb.dataset.seg);
    const seg = sb.parentElement; const bs = $$('[data-seg]', seg);
    bs.forEach(b => b.setAttribute('aria-checked', b === sb));
    seg.style.setProperty('--i', bs.indexOf(sb));
    const v = p.variantes.find(x => x.id === sb.dataset.seg); const nom = (v?.nombre || '').toLowerCase();
    const add = $('[data-bc-add]', it); $('.bc__add-t', add).textContent = `Sumar · ${nom}`; add.setAttribute('aria-label', `Sumar ${p.nombre} ${nom}`);
    return;
  }
  const add = e.target.closest('[data-bc-add]'); if (!add) return;
  const vid = varSel.get(p.id); const v = p.variantes.find(x => x.id === vid);
  kit.carrito.agregar(p.id, 1, { variante: vid, opc: opcVeggie(), origen: add });
  toast(`Sumaste ${p.nombre} ${v ? v.nombre.toLowerCase() : ''}${veggie?.checked ? ' veggie' : ''}`);
});
const cuentas = () => { const n = {}; (kit.carrito.lineas || []).forEach(l => { n[l.id] = (n[l.id] || 0) + l.cant; }); return n; };
function pintarBadges(bump) {
  const n = cuentas();
  $$('#carta-burgers .kit-item').forEach(it => {
    const q = $('.bc__q', it); if (!q) return; const c = n[it.dataset.id] || 0;
    const antes = Number(q.textContent) || 0; q.hidden = !c; q.textContent = c;
    if (bump && c > antes) reiniciar(q, 'bump');
  });
}
// contador de la barra
const topN = $('.top__n');
function pintarContador(bump) {
  const n = (kit.carrito.lineas || []).reduce((s, l) => s + l.cant, 0);
  topN.hidden = !n; topN.textContent = n;
  if (bump && n) reiniciar(topN, 'bump');
}
document.addEventListener('kit:carrito', (e) => { const b = (e.detail?.delta || 0) > 0; pintarBadges(b); pintarContador(b); });
kit.carrito.listo?.then(() => { pintarBadges(); pintarContador(); });

// carrusel de burgers en el celu: puntitos
const dotsEl = $('[data-cb-dots]');
function armarDots() {
  const panel = $('.kit-carta__panel', cartaB); if (!panel || !dotsEl) return;
  const its = $$('.kit-item', panel);
  dotsEl.innerHTML = its.map((_, i) => `<i${i ? '' : ' class="on"'}></i>`).join('');
  const marcar = () => {
    const w = its[0]?.getBoundingClientRect().width || 1;
    const k = Math.round(panel.scrollLeft / (w + 14));
    $$('i', dotsEl).forEach((d, i) => d.classList.toggle('on', i === Math.min(k, its.length - 1)));
  };
  panel.addEventListener('scroll', () => requestAnimationFrame(marcar), { passive: true });
}

// sumale: pestañas en el celu
const tabs = $$('.ctab');
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => { const on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on); });
  $$('[data-grupo]').forEach(g => g.classList.toggle('is-on', g.dataset.grupo === t.dataset.g));
}));

// =========================================================
// APILÁ TU SMASH
// =========================================================
const smash = (() => {
  const elige = $('[data-sm-elige]'), plato = $('[data-sm-plato]'), pila = $('[data-sm-pila]'), hint = $('[data-sm-hint]');
  const bMenos = $('[data-sm-menos]'), bMas = $('[data-sm-mas]'), nEl = $('[data-sm-n]');
  const card = $('[data-sm-card]'), tamEl = $('[data-sm-tam]'), nomEl = $('[data-sm-nom]'), preEl = $('[data-sm-pre]'), sumar = $('[data-sm-sumar]');
  const VAR = ['simple', 'doble', 'triple'];
  let id = ORDEN[0], n = 1, armado = false, tocado = false;

  const topping = (t) => (t === 'salsa' || t === 'must') ? `<i class="tp-${t}"></i>` : `<i class="tp-${t}"></i>`;
  const capaTop = () => `<div class="cp cp--top" aria-hidden="true">${(AUTOR[id]?.top || []).map(topping).join('')}</div>`;
  const carne = (anim) => `<div class="cp cp--carne${anim ? ' entra' : ''}" data-carne aria-hidden="true"></div><div class="cp cp--ched${anim ? ' entra' : ''}" data-ched aria-hidden="true"></div>`;
  function armar() {
    pila.innerHTML = `<div class="cp cp--bb" aria-hidden="true"></div>${Array.from({ length: n }, () => carne(false)).join('')}${capaTop()}<div class="cp cp--bt${tocado || reduce ? '' : ' respira'}" data-bt aria-hidden="true"></div>`;
  }
  function pintarElige() {
    elige.innerHTML = ORDEN.map(pid => {
      const p = productos.get(pid); const a = AUTOR[pid];
      return `<button type="button" class="selb" role="radio" aria-checked="${pid === id}" data-sm-id="${pid}">${p?.foto ? `<img src="${esc(asset(p.foto))}" width="96" height="96" alt="" loading="lazy">` : ''}<span><strong>${esc((p?.nombre || pid).replace(/ burger$/i, ''))}</strong><small>de ${a.quien} ${a.signo}</small></span></button>`;
    }).join('');
  }
  function pintarCard(anim) {
    const p = productos.get(id); const v = p?.variantes?.find(x => x.id === VAR[n - 1]);
    const veg = veggie?.checked;
    tamEl.textContent = `${v?.nombre || VAR[n - 1]} · ${n} ${veg ? (n > 1 ? 'veggies' : 'veggie') : (n > 1 ? 'carnes' : 'carne')}`;
    nomEl.textContent = (p?.nombre || '').replace(/ burger$/i, '') + (veg ? ' veggie' : '');
    const nuevo = v ? money(v.precio) : 'Consultar';
    if (preEl.textContent !== nuevo) { preEl.textContent = nuevo; if (anim && !reduce) reiniciar(preEl, 'tick'); }
    sumar.disabled = !v;
    nEl.textContent = `Smash ×${n}`;
    bMenos.disabled = n <= 1; bMas.disabled = false;
  }
  function crecer() {
    if (n >= 3) { if (!reduce) reiniciar(pila, 'nope'); toast('Hasta triple llegamos 🐐'); return; }
    n++;
    const tp = $('.cp--top', pila); tp.insertAdjacentHTML('beforebegin', carne(!reduce));
    if (!reduce) reiniciar(pila, 'aplasta');
    pintarCard(true);
  }
  function achicar() {
    if (n <= 1) return; n--;
    const cs = $$('[data-carne]', pila), ch = $$('[data-ched]', pila);
    const c = cs[cs.length - 1], h = ch[ch.length - 1];
    if (reduce) { c.remove(); h.remove(); } else { c.classList.add('sale'); h.classList.add('sale'); setTimeout(() => { c.remove(); h.remove(); }, 380); }
    pintarCard(true);
  }
  function primerToque() { if (tocado) return; tocado = true; hint.classList.add('chau'); $('[data-bt]', pila)?.classList.remove('respira'); }

  elige.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sm-id]'); if (!b || b.dataset.smId === id) return;
    id = b.dataset.smId;
    $$('[data-sm-id]', elige).forEach(x => x.setAttribute('aria-checked', x === b));
    armar(); if (!reduce) { $$('.cp', pila).forEach((c, i) => { c.style.animationDelay = `${i * 40}ms`; c.classList.add('entra'); }); reiniciar(card, 'pop'); }
    pintarCard(true);
  });
  elige.addEventListener('keydown', (e) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return; e.preventDefault();
    const bs = $$('[data-sm-id]', elige); const k = (bs.findIndex(b => b.dataset.smId === id) + (/Down|Right/.test(e.key) ? 1 : -1) + bs.length) % bs.length;
    bs[k].click(); bs[k].focus();
  });
  bMas.addEventListener('click', () => { primerToque(); crecer(); });
  bMenos.addEventListener('click', () => { primerToque(); achicar(); });
  sumar.addEventListener('click', () => {
    const p = productos.get(id); if (!p) return; const vid = VAR[n - 1]; const v = p.variantes.find(x => x.id === vid);
    kit.carrito.agregar(p.id, 1, { variante: vid, opc: opcVeggie(), origen: sumar });
    toast(`Sumaste ${p.nombre} ${v ? v.nombre.toLowerCase() : ''}${veggie?.checked ? ' veggie' : ''}`);
  });

  // arrastrar el pan de arriba hacia abajo = smash
  let drag = null;
  plato.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    const bt = e.target.closest('[data-bt]'); if (!bt) return;
    e.preventDefault(); primerToque();
    drag = { y: e.clientY, bt, dy: 0 }; plato.classList.add('arrastra'); plato.setPointerCapture(e.pointerId);
  });
  plato.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const u = plato.clientWidth / 100; const dy = Math.max(-u * 3, Math.min(u * 12, e.clientY - drag.y)); drag.dy = dy;
    drag.bt.style.transform = `translateY(${dy}px) scale(${1 + Math.max(0, dy) / (u * 120)}, ${1 - Math.max(0, dy) / (u * 80)})`;
  });
  const soltar = () => {
    if (!drag) return; const d = drag; drag = null; plato.classList.remove('arrastra');
    d.bt.style.transform = '';
    if (d.dy > plato.clientWidth * 0.05) crecer();
  };
  plato.addEventListener('pointerup', soltar);
  plato.addEventListener('pointercancel', soltar);

  return {
    refrescar() {
      if (!productos.size) return;
      if (!armado) { armado = true; pintarElige(); armar(); }
      pintarCard(false);
    },
  };
})();
pendientes.splice(0).forEach(alCarta);

// =========================================================
// OBRA: pista de reels (arrastre con mouse + flechas)
// =========================================================
const pista = $('[data-pista]');
(() => {
  let d = null, bloquearClick = false;
  const paso1 = () => { const c = $('.reel', pista); return c.getBoundingClientRect().width + parseFloat(getComputedStyle(pista).columnGap || 16); };
  pista.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button) return; d = { x: e.clientX, s: pista.scrollLeft, m: false }; });
  pista.addEventListener('dragstart', (e) => e.preventDefault());
  addEventListener('pointermove', (e) => { if (!d) return; const dx = e.clientX - d.x; if (!d.m && Math.abs(dx) > 5) { d.m = true; pista.classList.add('arrastra'); } if (d.m) pista.scrollLeft = d.s - dx; });
  addEventListener('pointerup', () => {
    if (!d) return; const m = d.m; d = null;
    if (m) { bloquearClick = true; setTimeout(() => { bloquearClick = false; }, 60); pista.classList.remove('arrastra'); const w = paso1(); pista.scrollTo({ left: Math.round(pista.scrollLeft / w) * w, behavior: 'smooth' }); }
  });
  pista.addEventListener('click', (e) => { if (bloquearClick) { e.preventDefault(); e.stopPropagation(); } }, true);
  const [bp, bn] = $$('[data-pista-mover]');
  bp?.addEventListener('click', () => pista.scrollBy({ left: -paso1() * 2, behavior: 'smooth' }));
  bn?.addEventListener('click', () => pista.scrollBy({ left: paso1() * 2, behavior: 'smooth' }));
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

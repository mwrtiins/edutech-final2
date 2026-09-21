/* ---------- céu estrelado ---------- */
const SVGNS = "http://www.w3.org/2000/svg";

function criarSVG(tag, atributos) {
  const el = document.createElementNS(SVGNS, tag);
  for (const chave in atributos) el.setAttribute(chave, atributos[chave]);
  return el;
}

function montarEstrelas() {
  const container = document.getElementById("estrelas");
  if (!container) return;

  const svg = criarSVG("svg", { viewBox: "0 0 1600 900", preserveAspectRatio: "xMidYMid slice" });
  const quantidade = window.innerWidth < 700 ? 90 : 160;

  for (let i = 0; i < quantidade; i++) {
    const estrela = criarSVG("circle", {
      cx: (Math.random() * 1600).toFixed(1),
      cy: (Math.random() * 900).toFixed(1),
      r: (0.6 + Math.random() * 1.5).toFixed(2),
      fill: "#dbeafe",
      "fill-opacity": (0.25 + Math.random() * 0.5).toFixed(2)
    });
    if (Math.random() < 0.35) {
      estrela.setAttribute("class", "cintilante");
      estrela.style.animationDelay = (-Math.random() * 3).toFixed(2) + "s";
      estrela.style.animationDuration = (2 + Math.random() * 2.5).toFixed(2) + "s";
    }
    svg.appendChild(estrela);
  }
  container.appendChild(svg);
}

/* ---------- skyline, nuvens e aviões do fundo (mesma paleta do site) ---------- */
function montarSkyline() {
  const svg = document.getElementById("skyline");
  if (!svg) return;
  const W = Math.round(svg.clientWidth || window.innerWidth), H = Math.round(svg.clientHeight || 320);
  const s = Math.min(1.35, Math.max(.7, H / 470)); /* escala dos prédios conforme a altura do céu */
  const r = rng(2026);
  const f = function (n) { return (Math.round(n * 10) / 10).toString(); };
  const pts = function (a) { return a.map(f).join(" "); };
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.setAttribute("preserveAspectRatio", "xMidYMax slice");

  const grad = function (id, y1, y2, paradas) {
    return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="0" y1="' + y1 + '" x2="0" y2="' + y2 + '">' +
      paradas.map(function (p) { return '<stop offset="' + p[0] + '" stop-color="' + p[1] + '"' + (p[2] != null ? ' stop-opacity="' + p[2] + '"' : "") + "/>"; }).join("") + "</linearGradient>";
  };
  let o = "<defs>" +
    grad("skMonte", H * .3, H, [[0, "#6d8cff", .30], [1, "#4f7cff", .04]]) +
    grad("skLonge", H * .2, H, [[0, "#86a3ff", .40], [1, "#3d5fc9", .14]]) +
    grad("skMeio", 0, H, [[0, "#4a72e6"], [.55, "#22459f"], [1, "#2b2a8e"]]) +
    grad("skPerto", 0, H, [[0, "#2149bd"], [.55, "#10286f"], [1, "#221d76"]]) +
    grad("skTorreA", 0, H, [[0, "#9dbaff"], [.6, "#3559cf"], [1, "#2a2a9a"]]) +
    grad("skTorreB", 0, H, [[0, "#7ea0ff"], [.55, "#2447b8"], [1, "#33279a"]]) +
    grad("skNevoa", H, H * .45, [[0, "#7c3aed", .5], [.5, "#4f7cff", .16], [1, "#4f7cff", 0]]) +
    "</defs>";

  /* montanha ao fundo, bem suave */
  let d = "M0," + H + "V" + f(H * .6);
  const n = 6;
  for (let i = 0; i < n; i++) {
    const cx = W * (i + .5) / n, ex = W * (i + 1) / n;
    d += "Q" + f(cx) + "," + f(H * (.36 + r() * .2)) + " " + f(ex) + "," + f(H * (.5 + r() * .12));
  }
  o += '<path d="' + d + 'V' + H + 'Z" fill="url(#skMonte)"/>';

  /* janelas acesas de um prédio (tudo num path só, por cor) */
  function janelas(x, y, w, h, dens) {
    const px = Math.max(6, 7 * s), py = Math.max(8, 9 * s), ww = Math.max(2.4, 3 * s), wh = Math.max(3, 4 * s);
    let c = "", b = "", v = "";
    for (let yy = y + 8; yy + wh < H - 3; yy += py) {
      for (let xx = x + 4; xx + ww < x + w - 3; xx += px) {
        if (r() > dens) continue;
        const seg = "M" + f(xx) + "," + f(yy) + "h" + f(ww) + "v" + f(wh) + "h" + f(-ww) + "z", q = r();
        if (q < .55) c += seg; else if (q < .9) b += seg; else v += seg;
      }
    }
    return (c ? '<path d="' + c + '" fill="#67e8f9" fill-opacity=".66"/>' : "") +
      (b ? '<path d="' + b + '" fill="#e0f2fe" fill-opacity=".72"/>' : "") +
      (v ? '<path d="' + v + '" fill="#a5b4fc" fill-opacity=".7"/>' : "");
  }
  let antenas = 0;
  function predio(x, w, h, fill, dens, borda) {
    const y = H - h, base = H + 2, t = r();
    let dd, topo = 0;
    if (t < .55) dd = "M" + f(x) + "," + base + "V" + f(y) + "H" + f(x + w) + "V" + base + "Z";
    else if (t < .75) { topo = Math.min(h * .18, 24 * s); dd = "M" + f(x) + "," + base + "V" + f(y + topo) + "L" + f(x + w) + "," + f(y) + "V" + base + "Z"; }
    else if (t < .9) { const w2 = w * .62, x2 = x + (w - w2) / 2, y2 = y - Math.min(h * .14, 22 * s); topo = -1; dd = "M" + f(x) + "," + base + "V" + f(y) + "H" + f(x2) + "V" + f(y2) + "H" + f(x2 + w2) + "V" + f(y) + "H" + f(x + w) + "V" + base + "Z"; }
    else { topo = w / 2; dd = "M" + f(x) + "," + base + "V" + f(y + w / 2) + "A" + f(w / 2) + "," + f(w / 2) + " 0 0 1 " + f(x + w) + "," + f(y + w / 2) + "V" + base + "Z"; }
    let g = '<path d="' + dd + '" fill="' + fill + '"/>';
    if (borda) g += '<path d="M' + f(x + .5) + "," + f(y + Math.max(topo, 0)) + "V" + H + '" stroke="#9db8ff" stroke-opacity=".3" stroke-width="1" fill="none"/>' +
      '<path d="M' + f(x) + "," + f(y) + "H" + f(x + w) + '" stroke="#67e8f9" stroke-opacity=".22" stroke-width="1" fill="none"/>';
    if (dens) g += janelas(x, y + Math.max(topo, 0), w, h, dens);
    if (borda && h > H * .3 && antenas < 9 && r() < .3 && t < .55) {
      antenas++;
      const ax = x + w * (.3 + r() * .4), ah = (14 + r() * 14) * s;
      g += '<path d="M' + f(ax) + "," + f(y) + "V" + f(y - ah) + '" stroke="#b6c8ff" stroke-opacity=".6" stroke-width="1.2" fill="none"/>' +
        '<circle cx="' + f(ax) + '" cy="' + f(y - ah) + '" r="1.8" fill="#22d3ee" class="pisca" style="animation-delay:-' + (r() * 2).toFixed(1) + 's"/>';
    }
    return g;
  }
  function fileira(hMin, hMax, wMin, wMax, fill, dens, borda, passo, folga) {
    let g = "";
    for (let x = -20 * s; x < W + 20; ) {
      const w = (wMin + r() * (wMax - wMin)) * s, h = H * (hMin + r() * (hMax - hMin));
      g += predio(x, w, h, fill, dens, borda);
      x += w * passo + (folga ? r() * folga * s : 0);
    }
    return g;
  }

  /* três fileiras de prédios: longe (névoa), meio e perto */
  o += fileira(.28, .58, 24, 46, "url(#skLonge)", 0, false, .72, 0);
  o += fileira(.22, .58, 30, 62, "url(#skMeio)", .2, true, .88, 0);

  /* torre em treliça (branca, com losangos) */
  (function () {
    const cx = W * (W < 700 ? .24 : .085), hA = H * .8, w = 52 * s, x0 = cx - w / 2, x1 = cx + w / 2;
    const base = H + 2, ombro = H - hA * .6, pico = cx + w * .14, yPico = H - hA * .86;
    const corpo = [x0, base, x0, ombro, pico, yPico, x1, ombro, x1, base];
    let g = '<polygon points="' + pts(corpo) + '" fill="none" stroke="#7dd3fc" stroke-opacity=".2" stroke-width="6" stroke-linejoin="round"/>' +
      '<polygon points="' + pts(corpo) + '" fill="url(#skTorreA)"/>';
    const secoes = 5, alt = (base - ombro) / secoes;
    let tri = "", lin = "";
    for (let k = 0; k < secoes; k++) {
      const ya = base - k * alt, yb = ya - alt, ym = (ya + yb) / 2;
      tri += k % 2 ? "M" + f(x0) + "," + f(ya) + "L" + f(x0) + "," + f(yb) + "L" + f(cx) + "," + f(ym) + "Z" : "M" + f(x1) + "," + f(ya) + "L" + f(x1) + "," + f(yb) + "L" + f(cx) + "," + f(ym) + "Z";
      lin += "M" + f(x0) + "," + f(ya) + "L" + f(x1) + "," + f(yb) + "M" + f(x1) + "," + f(ya) + "L" + f(x0) + "," + f(yb) + "M" + f(x0) + "," + f(yb) + "H" + f(x1);
    }
    lin += "M" + f(x0) + "," + f(ombro) + "L" + f(x1) + "," + f(ombro - (ombro - yPico) * .5) + "M" + f(x1) + "," + f(ombro) + "L" + f(x0) + "," + f(ombro - (ombro - yPico) * .5) +
      "M" + f(pico - 4) + "," + f(yPico) + "v" + f(-22 * s) + "M" + f(pico + 4) + "," + f(yPico) + "v" + f(-22 * s);
    g += '<path d="' + tri + '" fill="#cfe0ff" fill-opacity=".2"/>' +
      '<path d="' + lin + '" stroke="#eaf2ff" stroke-opacity=".8" stroke-width="1.3" fill="none"/>' +
      '<polygon points="' + pts(corpo) + '" fill="none" stroke="#eaf2ff" stroke-opacity=".95" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<circle cx="' + f(pico) + '" cy="' + f(yPico - 22 * s) + '" r="2" fill="#22d3ee" class="pisca"/>';
    o += g;
  })();

  /* torre alta afunilada com coroa em arco */
  (function () {
    const cx = W * (W < 700 ? .72 : .385), hB = Math.min(H * .93, H - 36 * s), wb = 66 * s, wt = 46 * s;
    const base = H + 2, ombro = H - hB * .9, topo = H - hB;
    const xb0 = cx - wb / 2, xb1 = cx + wb / 2, xt0 = cx - wt / 2, xt1 = cx + wt / 2;
    const dd = "M" + f(xb0) + "," + base + "L" + f(xt0) + "," + f(ombro) + "Q" + f(xt0 + wt * .08) + "," + f(topo + 2) + " " + f(cx) + "," + f(topo) +
      "Q" + f(xt1 - wt * .08) + "," + f(topo + 2) + " " + f(xt1) + "," + f(ombro) + "L" + f(xb1) + "," + base + "Z";
    let g = '<path d="' + dd + '" fill="none" stroke="#7dd3fc" stroke-opacity=".18" stroke-width="6" stroke-linejoin="round"/>' +
      '<path d="' + dd + '" fill="url(#skTorreB)"/>' +
      '<path d="M' + f(xb0) + "," + base + "L" + f(xt0) + "," + f(ombro) + "H" + f(cx - wt * .12) + "L" + f(cx - wb * .12) + "," + base + 'Z" fill="#ffffff" fill-opacity=".1"/>';
    let faixas = "";
    for (let y = topo + 20 * s; y < H; y += 9 * s) {
      const k = y < ombro ? 0 : (y - ombro) / (base - ombro), wy = wt + (wb - wt) * k;
      faixas += "M" + f(cx - wy / 2) + "," + f(y) + "H" + f(cx + wy / 2);
    }
    g += '<path d="' + faixas + '" stroke="#08154a" stroke-opacity=".3" stroke-width="1" fill="none"/>' +
      '<path d="M' + f(cx) + "," + f(topo + 14 * s) + "V" + H + '" stroke="#08154a" stroke-opacity=".22" stroke-width="1" fill="none"/>' +
      janelas(xt0 + 2, topo + 26 * s, wt - 4, hB, .24) +
      '<path d="M' + f(xt1) + "," + f(ombro) + "L" + f(xb1) + "," + base + '" stroke="#22d3ee" stroke-opacity=".45" stroke-width="1.4" fill="none"/>' +
      '<path d="M' + f(cx) + "," + f(topo) + "v" + f(-16 * s) + '" stroke="#cfe0ff" stroke-width="1.6" fill="none"/>' +
      '<circle cx="' + f(cx) + '" cy="' + f(topo - 16 * s) + '" r="2.2" fill="#22d3ee" class="pisca"/>';
    o += g;
  })();

  /* névoa violeta no horizonte e a fileira da frente */
  o += '<rect x="0" y="' + f(H * .45) + '" width="' + W + '" height="' + f(H * .55) + '" fill="url(#skNevoa)"/>';
  o += fileira(.1, .34, 42, 92, "url(#skPerto)", .26, true, 1, 10);
  o += '<rect x="0" y="' + (H - 3) + '" width="' + W + '" height="3" fill="#050b22"/>';
  svg.innerHTML = o;
}

function nuvemSVG(id, r) {
  /* nuvem feita de "bolinhas" com degradê radial: as bordas ficam macias */
  const bolas = [[52, 70, 30], [96, 50, 38], [148, 46, 42], [198, 62, 33], [228, 74, 22], [130, 82, 34]];
  let g = '<defs><radialGradient id="nv' + id + '"><stop offset="0" stop-color="#dbe4ff" stop-opacity=".34"/><stop offset=".6" stop-color="#a5b4fc" stop-opacity=".14"/><stop offset="1" stop-color="#8ea2ff" stop-opacity="0"/></radialGradient></defs>';
  bolas.forEach(function (b) {
    const k = .85 + r() * .3;
    g += '<ellipse cx="' + (b[0] + (r() * 10 - 5)).toFixed(0) + '" cy="' + (b[1] + 8 + (r() * 8 - 4)).toFixed(0) + '" rx="' + (b[2] * k * 1.25).toFixed(0) + '" ry="' + (b[2] * k * .62).toFixed(0) + '" fill="url(#nv' + id + ')"/>';
  });
  return '<svg viewBox="0 0 270 120" aria-hidden="true" focusable="false">' + g + "</svg>";
}

function montarNuvens() {
  const box = document.getElementById("nuvens");
  if (!box) return;
  const r = rng(77), n = window.innerWidth < 700 ? 5 : 8;
  for (let i = 0; i < n; i++) {
    const dur = 110 + r() * 110, el = document.createElement("div");
    el.className = "nuvem";
    el.style.cssText = "--y:" + (3 + r() * 36).toFixed(1) + "%;--x:" + (r() * 80).toFixed(0) + "vw;--esc:" + (.8 + r() * 1.1).toFixed(2) +
      ";--dur:" + dur.toFixed(0) + "s;--delay:-" + (r() * dur).toFixed(0) + "s;--op:" + (.55 + r() * .45).toFixed(2) + ";--flip:" + (r() < .5 ? 1 : -1);
    el.innerHTML = nuvemSVG(i, r);
    box.appendChild(el);
  }
}

function montarAvioes() {
  const box = document.getElementById("avioes");
  if (!box) return;
  const aviao = '<svg viewBox="0 0 120 44" aria-hidden="true" focusable="false">' +
    '<path d="M14,18 L6,4 L20,4 L30,18Z" fill="#7aa2ff"/>' +
    '<path d="M4,22 C4,16 14,15 26,15 L86,15 C104,15 116,19 118,23 C114,28 100,30 84,30 L24,30 C12,30 4,28 4,22Z" fill="#dbe7ff"/>' +
    '<path d="M6,25 C16,29 40,30 84,30 C100,30 114,28 118,23 C110,26 60,27 6,25Z" fill="#a9c2ff" fill-opacity=".7"/>' +
    '<path d="M56,24 L82,24 L58,42 L46,42Z" fill="#7aa2ff"/>' +
    '<path d="M30,21h4M38,21h4M46,21h4M54,21h4M62,21h4M70,21h4M78,21h4" stroke="#5a7fe0" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="12" cy="5" r="1.8" fill="#22d3ee" class="pisca"/></svg>';
  const voos = [
    { y: 10, dur: 46, delay: -8, esc: 1, rev: false },
    { y: 23, dur: 70, delay: -40, esc: .7, rev: true },
    { y: 15, dur: 96, delay: -64, esc: .5, rev: false }
  ];
  voos.slice(0, window.innerWidth < 700 ? 2 : 3).forEach(function (v) {
    const el = document.createElement("div");
    el.className = "aviao" + (v.rev ? " reverso" : "");
    el.style.cssText = "--y:" + v.y + "%;--dur:" + v.dur + "s;--delay:" + v.delay + "s;--esc:" + v.esc;
    el.innerHTML = '<div class="aviao-in"><span class="rastro"></span>' + aviao + "</div>";
    box.appendChild(el);
  });
}

/* a skyline é desenhada nas medidas da tela; se a largura mudar de verdade, desenha de novo */
let larguraSkyline = 0, tSkyline;
function atualizarSkyline() {
  const w = window.innerWidth;
  if (Math.abs(w - larguraSkyline) < 30) return;
  larguraSkyline = w;
  montarSkyline();
}
window.addEventListener("resize", function () { clearTimeout(tSkyline); tSkyline = setTimeout(atualizarSkyline, 200); });

/* ---------- o céu reage bem de leve ao ponteiro ---------- */
function ativarParallax() {
  const estrelas = document.getElementById("estrelas");
  const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!estrelas || reduzido || !window.matchMedia("(pointer: fine)").matches) return;

  let metaX = 0, metaY = 0, x = 0, y = 0;

  window.addEventListener("pointermove", function (e) {
    metaX = (e.clientX / window.innerWidth - 0.5) * 2;
    metaY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener("pointerleave", function () {
    metaX = 0;
    metaY = 0;
  });

  function passo() {
    x += (metaX - x) * 0.05;
    y += (metaY - y) * 0.05;
    estrelas.style.transform = "translate3d(" + (x * 14).toFixed(1) + "px," + (y * 10).toFixed(1) + "px,0)";
    requestAnimationFrame(passo);
  }
  requestAnimationFrame(passo);
}

/* ---------- perguntas ---------- */
const perguntas = [



  {
    texto: "O que caracteriza uma cidade inteligente?",
    opcoes: [
      "O uso de tecnologia para melhorar serviços e a qualidade de vida.",
      "A existência de muitos prédios altos.",
      "A localização próxima ao litoral."
    ],
    certa: 0,
    regiao: "sus"
  },
  {
    texto: "Qual tecnologia conecta sensores e objetos pela internet nas cidades?",
    opcoes: [
      "Internet das Coisas (IoT).",
      "Impressão 3D.",
      "Realidade virtual."
    ],
    certa: 0,
    regiao: "tec"
  },
  {
    texto: "Como a mobilidade urbana inteligente ajuda a cidade?",
    opcoes: [
      "Aumentando o número de carros nas ruas.",
      "Reduzindo o trânsito com transporte integrado e dados em tempo real.",
      "Proibindo o uso de bicicletas."
    ],
    certa: 1,
    regiao: "mob"
  },
  {
    texto: "Qual é um exemplo de energia limpa usada em cidades inteligentes?",
    opcoes: [
      "Queima de carvão mineral.",
      "Motores a diesel.",
      "Painéis solares em prédios públicos."
    ],
    certa: 2,
    regiao: "ene"
  },
  {
    texto: "Por que os dados abertos são importantes numa cidade inteligente?",
    opcoes: [
      "Permitem que a população acompanhe e melhore os serviços públicos.",
      "Servem apenas para uso interno da prefeitura.",
      "Deixam a internet da cidade mais rápida."
    ],
    certa: 0,
    regiao: "con"
  },
  {
    texto: "Qual é uma das principais funções dos sensores em uma cidade inteligente?",
    opcoes: [
      "Coletar informações para ajudar na tomada de decisões.",
      "Substituir todos os trabalhadores da cidade.",
      "Aumentar o consumo de recursos naturais."
    ],
    certa: 0,
    regiao: "ene"
  },
  {
    texto: "Como a tecnologia pode melhorar o transporte público?",
    opcoes: [
      "Aumentando o número de veículos particulares.",
      "Usando dados para melhorar rotas e horários dos transportes.",
      "Diminuindo a quantidade de linhas de ônibus."
    ],
    certa: 1,
    regiao: "mob"
  },
  {
    texto: "Por que os dados dos moradores são importantes para uma cidade inteligente?",
    opcoes: [
      "Podem ajudar a identificar problemas e melhorar os serviços públicos.",
      "Servem apenas para criar propagandas.",
      "Impedem a cidade de fazer mudanças."
    ],
    certa: 0,
    regiao: "con"
  },
  {
    texto: "Qual situação representa melhor o uso de tecnologia na gestão de uma cidade?",
    opcoes: [
      "A prefeitura usar dados para identificar regiões que precisam de mais iluminação pública.",
      "A cidade construir ruas sem analisar o trânsito.",
      "Os serviços públicos funcionarem sem nenhum planejamento."
    ],
    certa: 0,
    regiao: "sus"
  },
  {
    texto: "Qual pode ser um problema no desenvolvimento de cidades inteligentes?",
    opcoes: [
      "A dificuldade de garantir segurança e privacidade dos dados.",
      "A existência de transporte público.",
      "O uso de energia renovável."
    ],
    certa: 0,
    regiao: "tec"
  }
];

/* ---------- fase extra do 21CTI (desbloqueada pelo easter egg) ---------- */
/* Não embaralha: a ordem das alternativas é a combinada (certa = índice 0, 1 ou 2).
   "foto" aparece ao lado da pergunta; "fotoPos" ajusta o enquadramento do recorte.
   "revelar" troca o texto da alternativa certa depois que o resultado é mostrado. */
const perguntasExtra = [
  {
    texto: "Quem deu o nome FBG para o Nicolas Macedo (mais conhecido como Nicolas da Mamãe)?",
    opcoes: ["Gabriela Silva", "Maria Rita", "Marcio Marçal JS"],
    certa: 0,
    foto: "../imgs/quiz/nicolas.jpg", fotoAlt: "Foto do Nicolas", fotoPos: "50% 78%"
  },
  {
    texto: "Quem é o melhor professor?",
    opcoes: ["Marcio JS", "Gabriel Bin Luna", "Nenhum, não temos rivalidade entre professores!"],
    certa: 2,
    revelar: "Benones melhor professor",
    foto: "../imgs/quiz/marcio.jpg", fotoAlt: "Foto do Marcio", fotoPos: "50% 35%"
  },
  {
    texto: "Qual a melhor sala do T.I?",
    opcoes: ["21TIA (os esquecidos)", "21TIB (deploráveis)", "21TIC (mais que perfeitinhos)"],
    certa: 2,
    foto: "../imgs/quiz/croti.jpg", fotoAlt: "Foto do croti", fotoPos: "50% 50%"
  },
  {
    texto: "Qual a melhor matéria do T.I?",
    opcoes: ["Desenvolvimento Web", "Banco de dados", "Po Obj"],
    certa: 0,
    foto: "../imgs/quiz/pk.jpg", fotoAlt: "Foto do pk", fotoPos: "50% 12%"
  }
];
const REGIAO_EXTRA = { id: "extra", nome: "Quiz extra do 21CTI", icone: "⭐" };

/* ---------- mascote em pixel art ---------- */
/* O boneco é uma grade de 32 x 55 células. Cada letra é uma cor da paleta.
   As expressões (sério, bravo, furioso) só sobrepõem o rosto e o vermelho
   da pele aumenta conforme ele fica bravo. O contorno claro é gerado
   automaticamente ao redor do desenho. */
const Mascote = (function () {
  const LARGURA = 32;
  const ALTURA = 55;

  const PALETA = { H: "#2d2729", h: "#4a4247", S: "#d9a48c", s: "#b97f68", L: "#ecc0a9", R: "#d98a7c", E: "#1a1016", W: "#ffffff", G: "#33262a", g: "#5a4442", J: "#2d3240", j: "#4b536b", d: "#1a1d27", K: "#2a2f3e", N: "#3b1a28", n: "#c58390", m: "#6a2b3d", O: "#e0827f", o: "#f0a8a0", M: "#6a2a30", Q: "#212b57", q: "#3f4f92", T: "#a9aecb", t: "#727aa0", u: "#d3d7ea", P: "#1e3466", p: "#2f4f96", B: "#0d0f16", b: "#2d3342" };
  const PELE = "SsLR"; // letras que ficam vermelhas quando ele se irrita

  /* Modo Ouro: roupa preta com detalhes dourados e óculos que brilham */
  const PALETA_OURO = { J: "#1b150a", j: "#c9971c", d: "#0c0903", K: "#1a1206", N: "#241804", n: "#ffd766", m: "#7a5a10",
    Q: "#6b4a0a", q: "#e0a916", T: "#ffe08a", t: "#c8921a", u: "#fff4c7", P: "#16110a", p: "#d9a11a", B: "#080602", b: "#4a3608" };
  let ouro = false;

  const BASE = [
    "..........HHHHHHHHHHHH..........",
    "........HHHHHHHHHHHHHHHH........",
    ".......HHHHHhHHHHHHhhHHHH.......",
    "......HHHHHHHHHHHHHHHHHHHH......",
    "......hhHHHHHHHHHHHHHHHHhh......",
    "......hhhHSSSSSSSSSSSSHhhh......",
    "......hhSSSSSSSSSSSSSSSShh......",
    "......hSSSLLSSSSSSSSLLSSSh......",
    "......sSSSSSSSSSSSSSSSSSSs......",
    ".....sKKKKKKKKKKKKKKKKKKKKs.....",
    "....SsKNnnNNNNKKKKNNNNnnNKsS....",
    "....SsKNnNNNNNKSSKNNNNNnNKsS....",
    "....SsKmmmmmmmKSSKmmmmmmmKsS....",
    ".....sSSKKKKKSSSSSSKKKKKSSs.....",
    ".....sSRRSSSSSssssSSSSSRRSs.....",
    ".....sSRRSSSSssssssSSSSRRSs.....",
    ".....sSSSGGGGGGGGGGGGGGSSSs.....",
    ".....sSSGGMWWWWWWWWWWMGGSSs.....",
    ".....sSSGGOOOooooooOOOGGSSs.....",
    "......sSSSGGgGGGGGgGGGSSSs......",
    ".......sSSSGGGgGGgGGGSSSs.......",
    "........sSSSGGGggGGGSSSs........",
    ".........sSSSSSSSSSSSSs.........",
    "........JJssssssssssssJJ........",
    "......JJJJJJjQQttQQjJJJJJJ......",
    ".....JJJJJJJjQQTTQQjJJJJJJJ.....",
    "....djJJJJJJJjQuuQjJJJJJJJjd....",
    "...djJJdJJJJJjQuuQjJJJJJdJJjd...",
    "...djJJdJJJJJjQTTQjJJJJJdJJjd...",
    "...djJJdJJJJJjQTTQjJJJJJdJJjd...",
    "..djJJdJJJJJJjQuuQjJJJJJJdJJjd..",
    "..djJJdJJJJJjQQuuQQjJJJJJdJJjd..",
    "..djJJdJJJJJjQQTTQQjJJJJJdJJjd..",
    ".djJJdJJJJJjQQQTTQQQjJJJJJdJJjd.",
    ".djJJdJJJJjQQQQuuQQQQjJJJJdJJjd.",
    ".djJJdJJJJjQqQQuuQQqQjJJJJdJJjd.",
    ".djJJdJJJjQqQQQTTQQQqQjJJJdJJjd.",
    ".djJJdJJJjQqQQQTTQQQqQjJJJdJJjd.",
    ".djJJdJJJjQqQQQuuQQQqQjJJJdJJjd.",
    ".djJSdjjjjQqQQQuuQQQqQjjjjdSJjd.",
    ".djsSdddddjQqQQTTQQqQjdddddSsjd.",
    "..djJJdJJJjQQQQttQQQQjJJJdJJjd..",
    "...djJJdJJBBBBBuuBBBBBJJdJJjd...",
    "...JddddPPPPPPPPPPPPPPPPddddJ...",
    "........PPpPPPPPPPPPPpPP........",
    "........PPpPPPPPPPPPPpPP........",
    "........PPpPPPPPPPPPPpPP........",
    "........PPpPPPP..PPPPpPP........",
    "........PPpPPPP..PPPPpPP........",
    "........PPpPPPP..PPPPpPP........",
    "........PPpPPPP..PPPPpPP........",
    "........PPpPPPP..PPPPpPP........",
    "........PPpPPPP..PPPPpPP........",
    "......BbbbBBBBB..BBBBBbbbB......",
    ".....BBBBBBBBBB..BBBBBBBBBB....."
  ];

  /* cada item: [linha, coluna, "letras"] */
  const EXPRESSOES = {
    serio: [[8, 8, "EEEEEE"], [8, 18, "EEEEEE"], [17, 10, "G"], [17, 11, "MMMMMMMMMM"], [17, 21, "G"], [18, 10, "GGGGGGGGGGGG"]],
    bravo: [[7, 8, "EEE"], [7, 21, "EEE"], [8, 11, "EEEE"], [8, 17, "EEEE"], [10, 13, "K"], [10, 18, "K"], [17, 10, "GGG"], [17, 13, "MMMMMM"], [17, 19, "GGG"], [18, 10, "G"], [18, 11, "MM"], [18, 13, "GGGGGG"], [18, 19, "MM"], [18, 21, "G"]],
    furioso: [[6, 8, "EE"], [6, 22, "EE"], [7, 9, "EEE"], [7, 20, "EEE"], [8, 12, "EEEEEEEE"], [10, 11, "KKK"], [10, 18, "KKK"], [11, 13, "K"], [11, 18, "K"], [17, 15, "MM"], [18, 10, "MMMMMMMMMMMM"]]
  };
  const EXPRESSAO_POR_NIVEL = [null, "serio", "bravo", "furioso", "furioso"];
  const TINTA = [0, 0.05, 0.2, 0.38, 0.5];
  const VERMELHO = [226, 59, 59];

  const FALA_INICIO = "Bora lá!";
  const FALAS_ACERTO = [
    "Boa FBG!", "Continue assim!", "Mandou bem!", "É isso aí!", "Show de bola!",
    "Você é fera!", "Tá voando!", "Mais uma no bolso!", "Arrasou!", "Orgulho de você!"
  ];
  const FALAS_ERRO = [
    "Ocorrência!", "Saia da sala!", "Pegue seu banquinho e saia de fininho!",
    "Isso vai pra ata!", "Anotei seu nome!"
  ];

  /* efeitos desenhados por cima (vapor, veia de raiva, brilhos do acerto) */
  function mais(c, r) {
    return '<path class="brilho" d="M' + c + " " + (r - 1) + "h1v3h-1z M" + (c - 1) + " " + r + 'h3v1h-3z"/>';
  }
  const SOMBRA = '<rect class="sombra" x="5" y="56" width="22" height="1"/>';
  const EFEITOS =
    '<g class="vapor">' +
      '<rect class="puf p1" x="32" y="6" width="2" height="2"/>' +
      '<rect class="puf p2" x="34" y="2" width="2" height="2"/>' +
      '<rect class="puf p3" x="33" y="11" width="2" height="2"/>' +
      '<rect class="puf p4" x="30" y="0" width="2" height="2"/>' +
    "</g>" +
    '<g class="veia"><path d="M17 5h1v1h-1z M19 5h1v1h-1z M18 6h1v1h-1z M17 7h1v1h-1z M19 7h1v1h-1z"/></g>' +
    '<g class="brilhos">' + mais(33, 3) + mais(30, -1) + mais(35, 9) + "</g>";

  /* ---------- estado ---------- */
  const est = { nivel: 0, erros: 0, acertos: 0, pose: "descanso", fixo: false };
  let el, elFala, elSprite;
  let tFala, tReacao;

  /* ---------- desenho ---------- */
  function cor(letra) {
    const hex = (ouro && PALETA_OURO[letra]) || PALETA[letra];
    const t = TINTA[est.nivel];
    if (!t || PELE.indexOf(letra) < 0) return hex;
    const n = parseInt(hex.slice(1), 16);
    const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return "rgb(" + rgb.map(function (v, i) {
      return Math.round(v + (VERMELHO[i] - v) * t);
    }).join(",") + ")";
  }

  function rect(x, y, w, fill) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="1"' +
      (fill ? ' fill="' + fill + '"' : "") + "/>";
  }

  function compor() {
    const g = BASE.map(function (l) { return l.split(""); });
    const nome = EXPRESSAO_POR_NIVEL[est.nivel];
    if (nome) {
      EXPRESSOES[nome].forEach(function (s) {
        for (let i = 0; i < s[2].length; i++) g[s[0]][s[1] + i] = s[2][i];
      });
    }
    return g;
  }

  /* a partir desta linha começam as pernas; o corte em X separa a esquerda da direita.
     Serve para o boneco andar: cada perna vira um grupo próprio que gira no quadril. */
  const LINHA_PERNAS = 44;
  const MEIO = 16;

  function desenhar(comPernas) {
    const g = compor();
    function letra(r, c) {
      return (r >= 0 && r < ALTURA && c >= 0 && c < LARGURA) ? g[r][c] : ".";
    }
    const contorno = { corpo: "", esq: "", dir: "" };
    const sprite = { corpo: "", esq: "", dir: "" };

    /* manda a faixa para o corpo ou para uma das pernas, cortando no meio se precisar */
    function por(alvo, x, y, w, fill) {
      if (!comPernas || y < LINHA_PERNAS) { alvo.corpo += rect(x, y, w, fill); return; }
      if (x + w <= MEIO) { alvo.esq += rect(x, y, w, fill); return; }
      if (x >= MEIO) { alvo.dir += rect(x, y, w, fill); return; }
      alvo.esq += rect(x, y, MEIO - x, fill);
      alvo.dir += rect(MEIO, y, x + w - MEIO, fill);
    }

    /* contorno: toda célula vazia encostada no desenho */
    for (let r = -1; r <= ALTURA; r++) {
      let ini = null;
      for (let c = -1; c <= LARGURA + 1; c++) {
        const borda = letra(r, c) === "." && (
          letra(r - 1, c) !== "." || letra(r + 1, c) !== "." ||
          letra(r, c - 1) !== "." || letra(r, c + 1) !== ".");
        if (borda) {
          if (ini === null) ini = c;
        } else if (ini !== null) {
          por(contorno, ini, r, c - ini);
          ini = null;
        }
      }
    }

    /* desenho: junta células vizinhas da mesma cor em uma só faixa */
    for (let r = 0; r < ALTURA; r++) {
      let c = 0;
      while (c < LARGURA) {
        const l = g[r][c];
        if (l === ".") { c++; continue; }
        let f = c + 1;
        while (f < LARGURA && g[r][f] === l) f++;
        por(sprite, c, r, f - c, cor(l));
        c = f;
      }
    }

    const corpo = '<g class="contorno">' + contorno.corpo + "</g>" + sprite.corpo;
    if (!comPernas) return corpo;
    return '<g class="corpo">' + corpo + "</g>" +
      '<g class="perna perna-esq"><g class="contorno">' + contorno.esq + "</g>" + sprite.esq + "</g>" +
      '<g class="perna perna-dir"><g class="contorno">' + contorno.dir + "</g>" + sprite.dir + "</g>";
  }

  function atualizar() {
    el.dataset.nivel = est.nivel;
    el.dataset.pose = est.pose;
    elSprite.innerHTML = desenhar();
  }

  /* ---------- fala ---------- */
  function falar(texto, brava, fixa) {
    clearTimeout(tFala);
    elFala.textContent = texto;
    elFala.classList.toggle("brava", !!brava);
    elFala.classList.add("visivel");
    if (!fixa) {
      const duracao = Math.max(1900, 1200 + texto.length * 55);
      tFala = setTimeout(function () { elFala.classList.remove("visivel"); }, duracao);
    }
  }

  /* ---------- reações ---------- */
  function reagir(acertou) {
    clearTimeout(tReacao);
    el.classList.remove("reage-acerto", "reage-erro");
    void el.offsetWidth; // reinicia a animação

    if (acertou) {
      est.acertos++;
      est.pose = "joinha";
      falar(FALAS_ACERTO[(est.acertos - 1) % FALAS_ACERTO.length], false);
      el.classList.add("reage-acerto");
    } else {
      est.erros++;
      est.nivel = Math.min(est.erros, 4);
      est.pose = "descanso";
      falar(FALAS_ERRO[(est.erros - 1) % FALAS_ERRO.length], est.nivel >= 2);
      el.classList.add("reage-erro");
    }
    atualizar();

    tReacao = setTimeout(function () {
      el.classList.remove("reage-acerto", "reage-erro");
      if (!est.fixo) {
        est.pose = "descanso";
        atualizar();
      }
    }, acertou ? 1800 : 1500);
  }

  function encerrar() {
    clearTimeout(tReacao);
    clearTimeout(tFala);
    est.fixo = true;
    el.classList.remove("reage-acerto", "reage-erro");
    elFala.classList.remove("visivel");
  }

  function reiniciar() {
    clearTimeout(tReacao);
    el.classList.remove("reage-acerto", "reage-erro");
    est.nivel = 0; est.erros = 0; est.acertos = 0;
    est.fixo = false; est.pose = "descanso";
    atualizar();
    falar(FALA_INICIO, false);
  }

  function iniciar() {
    el = document.getElementById("mascote");
    if (!el) return;
    elFala = document.getElementById("fala");
    const svg = document.getElementById("mascote-svg");
    svg.innerHTML = SOMBRA + '<g class="sprite"></g>' + EFEITOS;
    elSprite = svg.querySelector(".sprite");
    atualizar();
    falar(FALA_INICIO, false);
  }

  function modoOuro(ligado) {
    ouro = !!ligado;
    if (elSprite) atualizar();
  }

  return { iniciar: iniciar, reagir: reagir, encerrar: encerrar, reiniciar: reiniciar, miniatura: desenhar, ouro: modoOuro };
})();

/* ---------- sons (gerados pelo navegador, sem arquivos) ---------- */
/* Tudo é bem baixinho. O botão no canto da tela liga e desliga o som. */
const Som = (function () {
  const VOLUME = 0.06;
  let ctx = null;
  let mudo = false;
  try { mudo = localStorage.getItem("smartcity-mudo") === "1"; } catch (e) {}

  function contexto() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  /* uma nota: sobe rapidinho e some devagar, para soar macio */
  function nota(freq, inicio, duracao, tipo, volume, freqFim) {
    const c = contexto();
    if (!c) return;
    const t0 = c.currentTime + inicio;
    const osc = c.createOscillator();
    const ganho = c.createGain();
    osc.type = tipo || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    if (freqFim) osc.frequency.exponentialRampToValueAtTime(freqFim, t0 + duracao);
    ganho.gain.setValueAtTime(0.0001, t0);
    ganho.gain.exponentialRampToValueAtTime(volume, t0 + 0.025);
    ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + duracao);
    osc.connect(ganho);
    ganho.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + duracao + 0.05);
  }

  /* rajada de ruído filtrado: serve de palma e de estouro */
  function ruido(inicio, duracao, volume, freq, tipo) {
    const c = contexto();
    if (!c) return;
    const t0 = c.currentTime + inicio;
    const n = Math.max(1, Math.floor(c.sampleRate * duracao));
    const buf = c.createBuffer(1, n, c.sampleRate);
    const dados = buf.getChannelData(0);
    for (let i = 0; i < n; i++) dados[i] = Math.random() * 2 - 1;
    const fonte = c.createBufferSource();
    fonte.buffer = buf;
    const filtro = c.createBiquadFilter();
    filtro.type = tipo;
    filtro.frequency.value = freq;
    const ganho = c.createGain();
    ganho.gain.setValueAtTime(volume, t0);
    ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + duracao);
    fonte.connect(filtro);
    filtro.connect(ganho);
    ganho.connect(c.destination);
    fonte.start(t0);
  }

  function tocar(fazer) {
    if (mudo) return;
    try { fazer(); } catch (e) {}
  }

  return {
    /* acerto: dois toquinhos subindo */
    acerto: function () {
      tocar(function () {
        nota(659.25, 0, 0.22, "sine", VOLUME);
        nota(880, 0.11, 0.34, "sine", VOLUME);
        nota(1318.5, 0.11, 0.3, "sine", VOLUME * 0.25);
      });
    },
    /* erro: duas notas graves descendo, bem suave */
    erro: function () {
      tocar(function () {
        nota(230, 0, 0.26, "triangle", VOLUME * 1.1, 165);
        nota(170, 0.17, 0.36, "triangle", VOLUME, 115);
      });
    },
    /* conclusão: arpejo subindo e um acorde final */
    conclusao: function () {
      tocar(function () {
        nota(523.25, 0, 0.22, "sine", VOLUME);
        nota(659.25, 0.13, 0.22, "sine", VOLUME);
        nota(783.99, 0.26, 0.22, "sine", VOLUME);
        nota(1046.5, 0.39, 0.9, "sine", VOLUME);
        nota(659.25, 0.39, 0.9, "sine", VOLUME * 0.6);
        nota(783.99, 0.39, 0.9, "sine", VOLUME * 0.6);
      });
    },
    /* surpresa: um estouro bem alto seguido de uma salva de palmas */
    surpresa: function () {
      tocar(function () {
        nota(160, 0, 0.7, "sine", 0.7, 35);
        ruido(0, 0.55, 0.6, 900, "lowpass");
        ruido(0, 0.12, 0.4, 3000, "highpass");
        for (let i = 0; i < 46; i++) {
          ruido(0.35 + Math.random() * 1.9, 0.05 + Math.random() * 0.05,
            0.15 + Math.random() * 0.25, 1400 + Math.random() * 2200, "bandpass");
        }
      });
    },
    /* modo ouro: onda grave subindo, arpejo cintilante e acorde brilhante */
    ouro: function () {
      tocar(function () {
        nota(98, 0, 1.3, "sawtooth", VOLUME * 0.5, 392);
        [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568, 2093].forEach(function (f, i) {
          nota(f, 0.12 + i * 0.09, 0.5, "triangle", VOLUME * 0.9);
          nota(f * 2, 0.14 + i * 0.09, 0.35, "sine", VOLUME * 0.3);
        });
        nota(1046.5, 0.85, 1.3, "sine", VOLUME);
        nota(1318.5, 0.85, 1.3, "sine", VOLUME * 0.7);
        nota(1568, 0.85, 1.3, "sine", VOLUME * 0.6);
        ruido(0.1, 0.8, 0.1, 6000, "highpass");
      });
    },
    estaMudo: function () { return mudo; },
    alternar: function () {
      mudo = !mudo;
      try { localStorage.setItem("smartcity-mudo", mudo ? "1" : "0"); } catch (e) {}
      if (!mudo) tocar(function () { nota(784, 0, 0.16, "sine", VOLUME * 0.8); });
      return mudo;
    }
  };
})();

/* ---------- lógica do quiz ---------- */
/* a cada partida (e a cada "Refazer") as alternativas trocam de lugar */
function embaralhar(lista) {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = lista[i];
    lista[i] = lista[j];
    lista[j] = t;
  }
  return lista;
}

function montarRodada() {
  return perguntas.map(function (p) {
    const itens = embaralhar(p.opcoes.map(function (texto, i) {
      return { texto: texto, certa: i === p.certa };
    }));
    return {
      regiao: p.regiao,
      texto: p.texto,
      opcoes: itens.map(function (o) { return o.texto; }),
      certa: itens.findIndex(function (o) { return o.certa; })
    };
  });
}

let rodada = montarRodada();

const letras = ["A", "B", "C", "D"];
let atual = 0;
let acertos = 0;
let escolhida = null;
let respondida = false;
let perguntasRegiao = []; /* perguntas da região aberta */

const elNumGrande = document.getElementById("numGrande");
const elNumTotal = document.getElementById("numTotal");
const elSegmentos = document.getElementById("segmentos");
const elPergunta = document.getElementById("pergunta");
const elOpcoes = document.getElementById("opcoes");
const elBotao = document.getElementById("botao");
const telaQuiz = document.getElementById("tela-quiz");
const telaFim = document.getElementById("tela-fim");
const elPontos = document.getElementById("pontos");

/* monta os segmentos de progresso da região (um por pergunta) */
const segmentos = elSegmentos.children;
function montarSegmentos(total) {
  elSegmentos.innerHTML = "";
  for (let i = 0; i < total; i++) {
    const seg = document.createElement("div");
    seg.className = "segmento";
    elSegmentos.appendChild(seg);
  }
}

function atualizarSegmentos(concluidos) {
  for (let i = 0; i < segmentos.length; i++) {
    segmentos[i].classList.remove("feito", "atual");
    if (i < concluidos) segmentos[i].classList.add("feito");
    else if (i === concluidos) segmentos[i].classList.add("atual");
  }
}

/* ---------- easter egg: a alternativa do "Marcio" foge do clique ---------- */
/* Qualquer alternativa que contenha "marcio" (com ou sem acento) sai correndo para um
   lugar aleatório da tela cada vez que alguém CLICA nela (só o clique move; passar o mouse
   não). Depois de FUGAS_MAX tentativas ela desiste, volta para o lugar dela e passa a
   funcionar normalmente. Se a pessoa escolher outra alternativa, o botão do Marcio trava:
   volta para o lugar (se estava fugindo) e não se mexe mais nessa pergunta.
   Enquanto foge, o botão é levado para o <body> (o .card tem backdrop-filter e prenderia
   o position:fixed) e um espaço vazio fica no lugar dele para o layout não pular. */
const FUGAS_MAX = 5;
let esquivas = [];

function ehMarcio(texto) {
  return /marcio/i.test(String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
}

function limparEsquivas() {
  esquivas.forEach(function (e) { e.restaurar(); });
  esquivas = [];
}

function travarEsquivas() {
  esquivas.forEach(function (e) { e.travar(); });
}

function armarEsquiva(botao) {
  const est = { ativa: true, travada: false, solto: false, ph: null, tentativas: 0, timer: null };
  esquivas.push(est);

  function pontoDe(ev) {
    /* posição do ponteiro; se veio do teclado (clientX/Y = 0), usa o centro do botão */
    if (ev && (ev.clientX || ev.clientY)) return { x: ev.clientX, y: ev.clientY };
    const r = botao.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function soltar() {
    const r = botao.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    est.ph = document.createElement("div");
    est.ph.setAttribute("aria-hidden", "true");
    est.ph.style.height = r.height + "px";
    est.ph.style.marginBottom = getComputedStyle(botao).marginBottom;
    const tinhaFoco = document.activeElement === botao; /* mudar de pai tira o foco do teclado */
    botao.parentNode.insertBefore(est.ph, botao);
    document.body.appendChild(botao);
    if (tinhaFoco) botao.focus({ preventScroll: true });
    botao.classList.add("foge");
    botao.style.left = r.left + "px";
    botao.style.top = r.top + "px";
    botao.style.width = Math.min(r.width, 300, vw - 24) + "px";
    void botao.offsetWidth; /* fixa o ponto de partida para a animação começar dali */
    est.solto = true;
  }

  function sortearPosicao(w, h, p) {
    const m = 12;
    const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    const xMax = Math.max(m, vw - w - m), yMax = Math.max(m, vh - h - m);
    const evitar = [];
    document.querySelectorAll(".opcao, #botao, #voltarMapa, #somToggle").forEach(function (el) {
      if (el === botao) return;
      const r = el.getBoundingClientRect();
      if (r.width) evitar.push(r);
    });
    let melhor = { x: m, y: m }, melhorNota = -1;
    for (let i = 0; i < 60; i++) {
      const x = m + Math.random() * (xMax - m), y = m + Math.random() * (yMax - m);
      const d = Math.hypot(x + w / 2 - p.x, y + h / 2 - p.y);
      const livre = !evitar.some(function (r) {
        return x < r.right && x + w > r.left && y < r.bottom && y + h > r.top;
      });
      if (livre && d > 200) return { x: x, y: y };
      const nota = (livre ? 10000 : 0) + d; /* sem achar o ideal, fica com o mais longe do ponteiro */
      if (nota > melhorNota) { melhorNota = nota; melhor = { x: x, y: y }; }
    }
    return melhor;
  }

  function fugir(ev) {
    if (!est.ativa || est.travada || est.tentativas >= FUGAS_MAX) return; /* travado ou na volta: não foge nem conta */
    est.tentativas++;
    const p = pontoDe(ev);
    if (!est.solto) soltar();
    const pos = sortearPosicao(botao.offsetWidth, botao.offsetHeight, p);
    botao.style.left = pos.x + "px";
    botao.style.top = pos.y + "px";
    botao.style.setProperty("--giro", (Math.random() * 10 - 5).toFixed(1) + "deg");
    /* foi a última: deixa ele respirar um instante e manda de volta.
       Até ele estar de volta no lugar, o clique continua bloqueado (ativa segue true). */
    if (est.tentativas >= FUGAS_MAX) est.timer = setTimeout(voltar, 900);
  }

  function voltar() {
    if (!est.solto || !est.ph || !est.ph.parentNode) { est.restaurar(); return; }
    const r = est.ph.getBoundingClientRect();
    botao.style.left = r.left + "px";
    botao.style.top = r.top + "px";
    botao.style.width = r.width + "px";
    botao.style.setProperty("--giro", "0deg");
    est.timer = setTimeout(est.restaurar, 380);
  }

  /* devolve o botão ao lugar dele na hora, sem animação */
  est.restaurar = function () {
    clearTimeout(est.timer);
    est.ativa = false;
    if (!est.solto) return;
    est.solto = false;
    const tinhaFoco = document.activeElement === botao;
    if (est.ph && est.ph.parentNode) est.ph.parentNode.replaceChild(botao, est.ph);
    else if (botao.parentNode) botao.parentNode.removeChild(botao);
    botao.classList.remove("foge");
    botao.style.left = botao.style.top = botao.style.width = "";
    botao.style.removeProperty("--giro");
    if (tinhaFoco && botao.parentNode) botao.focus({ preventScroll: true });
  };

  /* outra alternativa foi escolhida: o Marcio não se mexe mais (se estava fugindo, volta pro lugar) */
  est.travar = function () {
    est.travada = true;
    if (est.solto) { clearTimeout(est.timer); voltar(); }
    else est.ativa = false;
  };

  /* se a janela mudar de tamanho, mantém o botão fugitivo dentro da tela */
  est.encaixar = function () {
    if (!est.solto) return;
    const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    const x = Math.min(parseFloat(botao.style.left) || 0, Math.max(12, vw - botao.offsetWidth - 12));
    const y = Math.min(parseFloat(botao.style.top) || 0, Math.max(12, vh - botao.offsetHeight - 12));
    botao.style.left = x + "px";
    botao.style.top = y + "px";
  };

  /* só o clique (mouse, toque ou Enter/Espaço) faz ele fugir; enquanto está ativo, nunca seleciona */
  botao.addEventListener("click", function (ev) {
    if (!est.ativa) return;
    ev.stopImmediatePropagation();
    ev.preventDefault();
    fugir(ev);
  });
}

window.addEventListener("resize", function () {
  esquivas.forEach(function (e) { e.encaixar(); });
});

function mostrarPergunta() {
  limparEsquivas();
  const p = perguntasRegiao[atual];
  escolhida = null;
  respondida = false;
  elCartao.classList.remove("acerto", "erro");

  elNumGrande.textContent = String(atual + 1).padStart(2, "0");
  atualizarSegmentos(atual);

  elPergunta.textContent = p.texto;
  elPergunta.classList.remove("anima-entra");
  void elPergunta.offsetWidth;
  elPergunta.classList.add("anima-entra");

  /* fase extra: foto ao lado da pergunta */
  const fig = document.getElementById("fotoPergunta");
  const img = document.getElementById("fotoImg");
  document.getElementById("perguntaLinha").classList.toggle("com-foto", !!p.foto);
  if (p.foto) {
    img.src = p.foto;
    img.alt = p.fotoAlt || "";
    img.style.objectPosition = p.fotoPos || "50% 50%";
    fig.hidden = false;
    fig.classList.remove("anima-entra");
    void fig.offsetWidth;
    fig.classList.add("anima-entra");
  } else {
    fig.hidden = true;
    img.removeAttribute("src");
  }

  elOpcoes.innerHTML = "";

  p.opcoes.forEach(function (textoOpcao, i) {
    const botao = document.createElement("button");
    botao.className = "opcao";
    botao.type = "button";
    botao.innerHTML = "<span class=\"letra\">" + letras[i] + "</span><span>" + textoOpcao + "</span>";

    /* easter egg: a alternativa do Marcio foge (registrada antes do clique normal, que ela pode bloquear) */
    if (ehMarcio(textoOpcao)) armarEsquiva(botao);

    botao.addEventListener("click", function () {
      if (respondida) return;
      escolhida = i;
      travarEsquivas(); /* escolheu uma alternativa: o botão do Marcio para de se mexer */
      document.querySelectorAll(".opcao").forEach(function (o) {
        o.classList.remove("marcada");
      });
      botao.classList.add("marcada");
      elBotao.disabled = false;
    });

    elOpcoes.appendChild(botao);
  });

  elBotao.textContent = "Enviar";
  elBotao.disabled = true;
}

function corrigir() {
  limparEsquivas(); /* a alternativa fugitiva volta ao lugar antes da correção */
  respondida = true;
  const p = perguntasRegiao[atual];

  document.querySelectorAll(".opcao").forEach(function (botao, i) {
    botao.disabled = true;
    botao.classList.remove("marcada");
    if (i === p.certa) {
      botao.classList.add("certa");
      if (p.revelar) {
        /* segura a altura para o layout (e o botão "Próxima") não pular quando o texto encolhe */
        botao.style.minHeight = botao.offsetHeight + "px";
        botao.classList.add("revelada");
        botao.lastElementChild.textContent = p.revelar;
      }
    } else if (i === escolhida) {
      botao.classList.add("errada");
    }
  });

  registrarResposta(escolhida === p.certa);
  elCartao.classList.add(escolhida === p.certa ? "acerto" : "erro");
  Mascote.reagir(escolhida === p.certa);
  if (escolhida === p.certa) Som.acerto(); else Som.erro();

  atualizarSegmentos(atual + 1);
  elBotao.textContent = (atual === perguntasRegiao.length - 1) ? "Ver resultado" : "Próxima";
}

function finalizar() {
  /* com as 5 regiões concluídas, o resultado é o geral (como era o quiz original) */
  fimGeral = !extra && !treino && salvo.concluidas.length === REGIOES.length;
  const nAcertos = fimGeral ? salvo.pontos : acertos;
  const nTotal = fimGeral ? perguntas.length : perguntasRegiao.length;

  telaQuiz.hidden = true;
  telaFim.hidden = false;
  const passou = nAcertos === nTotal;
  if (extra) {
    $("tituloFim").innerHTML = "Quiz extra concluído:<br><span class=\"ld\">21CTI</span>";
    $("refazer").textContent = "Refazer o quiz extra";
    $("xpFim").textContent = "Fase bônus: não vale XP.";
    encerrarOuroDepois(1400); /* terminou o quiz extra: o Modo Ouro se despede */
  } else $("tituloFim").innerHTML = fimGeral ? "Você Dominou o<br><span class=\"ld\">Quiz do Futuro</span>"
    : (passou ? "Missão concluída:" : "Missão quase concluída:") + "<br><span class=\"ld\">" + regiaoAtual.nome + "</span>";
  if (!extra) {
    $("refazer").textContent = fimGeral ? "Refazer o quiz" : (passou ? "Refazer missão" : "Tentar de novo");
    $("xpFim").textContent = (treino ? "Modo treino: sem XP" : "+" + xpMissao + " XP nesta missão · total " + salvo.xp + " XP") +
      (passou ? "" : ". Acerte todas as perguntas para liberar a próxima região.");
  }
  Mascote.encerrar(nAcertos, nTotal);
  Som.conclusao();

  const fim = (nAcertos === nTotal) ? " acertos. Parabéns!" : " acertos.";
  const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduzido || nAcertos === 0) {
    elPontos.textContent = nAcertos + "/" + nTotal + fim;
    return;
  }

  let n = 0;
  elPontos.textContent = "0/" + nTotal;
  const contador = setInterval(function () {
    n = n + 1;
    elPontos.textContent = n + "/" + nTotal + (n === nAcertos ? fim : "");
    if (n >= nAcertos) clearInterval(contador);
  }, 280);
}

elBotao.addEventListener("click", function () {
  if (!respondida) {
    corrigir();
  } else if (atual < perguntasRegiao.length - 1) {
    atual = atual + 1;
    mostrarPergunta();
  } else {
    finalizar();
  }
});

/* botão de som (liga / desliga) */
const botaoSom = document.getElementById("somToggle");
function atualizarBotaoSom() {
  const mudo = Som.estaMudo();
  botaoSom.classList.toggle("mudo", mudo);
  botaoSom.setAttribute("aria-pressed", mudo ? "true" : "false");
  botaoSom.setAttribute("aria-label", mudo ? "Ligar o som" : "Desligar o som");
  botaoSom.title = mudo ? "Ligar o som" : "Desligar o som";
}
botaoSom.addEventListener("click", function () {
  Som.alternar();
  atualizarBotaoSom();
});
atualizarBotaoSom();

/* ---------- mapa da SmartCity: regiões, XP e progresso salvo ---------- */
const REGIOES = [
  { id: "tec", nome: "Centro de Tecnologia", icone: "🏢", tema: ["predio", "predio", "predio", "torre"],
    desc: "O coração digital da cidade. Descubra como sensores e Internet das Coisas dão vida aos serviços urbanos e por que proteger a privacidade dos dados importa." },
  { id: "mob", nome: "Zona de Mobilidade", icone: "🚦", tema: ["semaforo", "semaforo", "garagem", "arvore"],
    desc: "Ruas, semáforos e transporte conectados. Veja como dados em tempo real reduzem o trânsito e melhoram rotas e horários do transporte público." },
  { id: "sus", nome: "Distrito Sustentável", icone: "🌱", tema: ["arvore", "arvore", "arvore", "arvore", "arvore"],
    desc: "Um bairro pensado para as pessoas e para o planeta. Entenda como a tecnologia melhora a qualidade de vida e o planejamento da cidade." },
  { id: "ene", nome: "Central de Energia", icone: "⚡", tema: ["painel", "painel", "painel", "torre"],
    desc: "Painéis solares e redes inteligentes movem a cidade. Explore a energia limpa e o papel dos sensores no uso dos recursos." },
  { id: "con", nome: "Cidade Conectada", icone: "🏥", tema: ["hospital", "predio", "torre", "arvore"],
    desc: "Onde tudo se encontra. Dados abertos e informações dos moradores ajudam a identificar problemas e a melhorar os serviços públicos." }
];
const XP_ACERTO = 10;
const CHAVE_SAVE = "smartcity-progresso";
const ROTULO = { bloqueada: "🔒 Bloqueada", andamento: "Em andamento", concluida: "✔ Concluída" };
const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const estreito = window.matchMedia("(max-width: 820px)");
const LAYOUTS = {
  largo: { W: 1000, H: 560, vert: false, pts: [[130, 410], [330, 190], [520, 400], [710, 190], [880, 410]] },
  estreito: { W: 400, H: 860, vert: true, pts: [[110, 190], [290, 340], [110, 500], [290, 660], [110, 800]] }
};
const $ = function (id) { return document.getElementById(id); };

function novoSave() {
  return { xp: 0, pontos: 0, desbloqueadas: [REGIOES[0].id], concluidas: [], regioes: {}, avatarEm: 0 };
}
let salvo = novoSave();
try {
  const lido = JSON.parse(localStorage.getItem(CHAVE_SAVE));
  if (lido && Array.isArray(lido.desbloqueadas) && Array.isArray(lido.concluidas) && lido.regioes) salvo = Object.assign(salvo, lido);
} catch (e) {}
function gravar() { try { localStorage.setItem(CHAVE_SAVE, JSON.stringify(salvo)); } catch (e) {} }

const elCartao = $("cartao");
let regiaoAtual = null, treino = false, xpMissao = 0, fimGeral = false, recemDesbloqueada = null;
let extra = false; /* true enquanto a fase extra do 21CTI está rodando */
let desenhoId = 0, tAviso;

function totalDe(id) { return perguntas.filter(function (p) { return p.regiao === id; }).length; }
function feitas(id) { return (salvo.regioes[id] || {}).feitas || 0; }
function totalFeitas() { return REGIOES.reduce(function (s, r) { return s + feitas(r.id); }, 0); }
function estadoDe(id) {
  if (salvo.concluidas.indexOf(id) >= 0) return "concluida";
  return salvo.desbloqueadas.indexOf(id) >= 0 ? "andamento" : "bloqueada";
}

/* ---------- telas ---------- */
const telas = { inicio: $("tela-inicio"), mapa: $("tela-mapa"), regiao: $("tela-regiao"), quiz: telaQuiz, fim: telaFim };
function ir(nome) {
  limparEsquivas();
  for (const k in telas) telas[k].hidden = (k !== nome);
  window.scrollTo(0, 0);
  if (nome === "mapa") { atualizarHud(); desenharMapa(); }
  if (nome === "inicio") atualizarInicio();
}
function avisar(texto) {
  const el = $("aviso");
  el.textContent = texto;
  el.classList.add("visivel");
  clearTimeout(tAviso);
  tAviso = setTimeout(function () { el.classList.remove("visivel"); }, 3600);
}
function atualizarInicio() {
  const tem = totalFeitas() > 0 || salvo.xp > 0;
  $("comecar").textContent = tem ? "Continuar" : "Entrar na SmartCity";
  $("zerar").hidden = !tem;
}
function atualizarHud() {
  const f = totalFeitas(), pct = Math.round(f / perguntas.length * 100);
  $("hudXp").textContent = salvo.xp;
  $("hudTxt").textContent = f + "/" + perguntas.length + " respostas · " + pct + "%";
  $("hudBarra").style.width = pct + "%";
  $("hudReg").textContent = salvo.concluidas.length + "/" + REGIOES.length;
}

/* ---------- região e missão ---------- */
function abrirRegiao(reg) {
  const est = estadoDe(reg.id);
  regiaoAtual = reg;
  $("regIcone").textContent = reg.icone;
  $("regNome").textContent = reg.nome;
  $("regDesc").textContent = reg.desc + (reg === REGIOES[REGIOES.length - 1] ? "" : " Acerte todas as perguntas para liberar a próxima região.");
  $("regStatus").textContent = ROTULO[est].replace(/^\S+ /, "") + " · " + feitas(reg.id) + "/" + totalDe(reg.id);
  $("iniciarMissao").textContent = est === "concluida" ? "Refazer missão (sem XP)" : "Iniciar missão";
  ir("regiao");
}

function iniciarMissao(reg, praticar) {
  extra = false;
  regiaoAtual = reg;
  treino = praticar;
  xpMissao = 0;
  rodada = montarRodada();
  perguntasRegiao = rodada.filter(function (p) { return p.regiao === reg.id; });
  atual = praticar ? 0 : Math.min(feitas(reg.id), perguntasRegiao.length - 1);
  acertos = praticar ? 0 : ((salvo.regioes[reg.id] || {}).acertos || 0);
  elNumTotal.textContent = "/" + String(perguntasRegiao.length).padStart(2, "0");
  montarSegmentos(perguntasRegiao.length);
  $("nomeRegiao").textContent = reg.icone + " " + reg.nome;
  $("xpRot").textContent = treino ? "Treino" : "XP";
  $("xpValor").textContent = treino ? "sem XP" : salvo.xp;
  Mascote.reiniciar();
  ir("quiz");
  mostrarPergunta();
}

/* fase extra: 4 perguntas, sem XP e sem mexer no progresso salvo */
function iniciarExtra() {
  extra = true;
  treino = true;
  fimGeral = false;
  xpMissao = 0;
  regiaoAtual = REGIAO_EXTRA;
  perguntasRegiao = perguntasExtra;
  atual = 0;
  acertos = 0;
  elNumTotal.textContent = "/" + String(perguntasRegiao.length).padStart(2, "0");
  montarSegmentos(perguntasRegiao.length);
  $("nomeRegiao").textContent = REGIAO_EXTRA.icone + " " + REGIAO_EXTRA.nome;
  $("xpRot").textContent = "Bônus";
  $("xpValor").textContent = "sem XP";
  Mascote.reiniciar();
  ir("quiz");
  mostrarPergunta();
}

/* chamada por corrigir(): conta o acerto e salva o progresso */
function registrarResposta(acertou) {
  if (acertou) acertos = acertos + 1;
  if (treino) return;
  const id = regiaoAtual.id;
  const r = salvo.regioes[id] || (salvo.regioes[id] = { feitas: 0, acertos: 0 });
  r.feitas = atual + 1;
  if (acertou) {
    r.acertos++;
    salvo.pontos++;
    salvo.xp += XP_ACERTO;
    xpMissao += XP_ACERTO;
  }
  if (r.feitas >= perguntasRegiao.length) {
    if (r.acertos >= perguntasRegiao.length) concluirRegiao(id);
    else {
      /* errou alguma: a região continua aberta e precisa ser refeita */
      salvo.pontos -= r.acertos;
      salvo.regioes[id] = { feitas: 0, acertos: 0 };
    }
  }
  gravar();
  mostrarXp(acertou);
}

function concluirRegiao(id) {
  if (salvo.concluidas.indexOf(id) < 0) salvo.concluidas.push(id);
  const prox = REGIOES[REGIOES.findIndex(function (r) { return r.id === id; }) + 1];
  if (prox && salvo.desbloqueadas.indexOf(prox.id) < 0) {
    salvo.desbloqueadas.push(prox.id);
    recemDesbloqueada = prox.id;
  }
}

function mostrarXp(ganhou) {
  const chip = $("xpChip");
  $("xpValor").textContent = salvo.xp;
  if (!ganhou) return;
  chip.classList.remove("bump");
  void chip.offsetWidth;
  chip.classList.add("bump");
  const pop = document.createElement("span");
  pop.className = "xp-pop";
  pop.textContent = "+" + XP_ACERTO + " XP";
  chip.appendChild(pop);
  setTimeout(function () { pop.remove(); }, 1300);
}

/* ---------- desenho do mapa (cidade isométrica, gerada por código) ---------- */
function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function R(x, y, w, h, f, c) {
  return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w + '" height="' + h + '" fill="' + f + '"' + (c ? ' class="' + c + '"' : "") + "/>";
}
/* ---------- cidade isométrica (azul-marinho + ciano, a paleta do site) ---------- */
function Pol(lista, fill, extra) {
  return '<polygon points="' + lista.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '" fill="' + fill + '"' + (extra || "") + "/>";
}
const ISO = { esq: "#0a1a4d", dir: "#12306f", topo: "#2b5cd6", luz: "#22d3ee", luzEsq: "#19b5d3", apagada: "#22418f" };

/* vértices da base de uma caixa: N (topo), E, W e S (frente). (x, y) = centro da base.
   da = comprimento na diagonal que desce para a direita; db = na que desce para a esquerda */
function geo(x, y, da, db) {
  const nx = x - (da - db) / 2, ny = y - (da + db) / 4;
  return { N: [nx, ny], E: [nx + da, ny + da / 2], W: [nx - db, ny + db / 2], S: [nx + da - db, ny + (da + db) / 2] };
}
/* caixa isométrica com aresta clara no topo; c = { esq, dir, topo } */
function caixa(x, y, da, db, h, c) {
  c = c || {};
  const g = geo(x, y, da, db);
  const up = function (p) { return [p[0], p[1] - h]; };
  return Pol([g.W, g.S, up(g.S), up(g.W)], c.esq || ISO.esq) +
    Pol([g.S, g.E, up(g.E), up(g.S)], c.dir || ISO.dir) +
    Pol([up(g.N), up(g.E), up(g.S), up(g.W)], c.topo || ISO.topo) +
    '<polyline points="' + [up(g.W), up(g.S), up(g.E)].map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") +
    '" fill="none" stroke="#7dd3fc" stroke-opacity=".4" stroke-width="1"/>';
}
/* base/calçada sob o prédio */
function pad(x, y, da, db) {
  const g = geo(x, y, da * 1.35, db * 1.35);
  return Pol([g.N, g.E, g.S, g.W], "#0e2a6b", ' fill-opacity=".55" stroke="#22d3ee" stroke-opacity=".16" stroke-width="1"');
}
/* janela desenhada em cima de uma face. f: { x0, yb, k } (k = +.5 face esquerda, -.5 face direita) */
function jan(f, u, ww, y0, y1, fill) {
  const xa = f.x0 + u, xb = xa + ww, ya = f.yb + f.k * u, yb = f.yb + f.k * (u + ww);
  return Pol([[xa, ya - y1], [xb, yb - y1], [xb, yb - y0], [xa, ya - y0]], fill);
}
function faces(x, y, da, db) {
  const g = geo(x, y, da, db);
  return [{ x0: g.W[0], yb: g.W[1], k: .5, len: da }, { x0: g.S[0], yb: g.S[1], k: -.5, len: db }];
}
/* fachadas iluminadas: "faixa" = tiras verticais de luz, "grade" = janelinhas */
function fachadas(x, y, da, db, h, r, modo) {
  let s = "";
  faces(x, y, da, db).forEach(function (f, fi) {
    const luz = fi === 1 ? ISO.luz : ISO.luzEsq;
    if (modo === "faixa") {
      const n = Math.max(2, Math.round(f.len / 6.5)), ww = f.len / n * .5;
      for (let i = 0; i < n; i++) s += jan(f, f.len / n * (i + .25), ww, 5, h - 6, r() < .85 ? luz : ISO.apagada);
    } else {
      const cols = Math.max(2, Math.round(f.len / 7.5)), rows = Math.max(1, Math.floor((h - 9) / 9));
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++)
        s += jan(f, f.len / cols * (i + .2), f.len / cols * .56, 6 + j * 9, 10.5 + j * 9, r() < .5 ? luz : ISO.apagada);
    }
  });
  return s;
}
/* clarão no topo do prédio + feixe de luz subindo */
function teto(cx, cy, w, r, alto) {
  const k = w * .55;
  return '<g class="feixe" style="animation-delay:-' + (r() * 4).toFixed(1) + 's">' +
    Pol([[cx - k * .9, cy], [cx - w * 1.05, cy - alto], [cx + w * 1.05, cy - alto], [cx + k * .9, cy]], "url(#gFeixe)") +
    Pol([[cx - k, cy], [cx, cy - k / 2], [cx + k, cy], [cx, cy + k / 2]], "#22d3ee") +
    Pol([[cx - k * .5, cy], [cx, cy - k / 4], [cx + k * .5, cy], [cx, cy + k / 4]], "#cffafe") + "</g>";
}
const CARROS = [
  { esq: "#8ea2cf", dir: "#b9c7e6", topo: "#e8f1ff" },
  { esq: "#0e7490", dir: "#0aa5c4", topo: "#22d3ee" },
  { esq: "#a5801a", dir: "#d1a51f", topo: "#facc15" },
  { esq: "#a83b3b", dir: "#d24d4d", topo: "#f87171" }
];
function carroIso(x, y, k, cor) {
  const c = CARROS[cor % CARROS.length];
  return caixa(x, y, 12 * k, 6 * k, 4 * k, c) + caixa(x, y - 4 * k, 6 * k, 4.4 * k, 3 * k, { esq: "#0a1330", dir: "#12306f", topo: "#bfe9ff" });
}
function onibusIso(x, y, k) {
  const c = { esq: "#12306f", dir: "#1e4fbf", topo: "#4f7cff" };
  let s = caixa(x, y, 30 * k, 8 * k, 9 * k, c);
  const f = faces(x, y, 30 * k, 8 * k)[0];
  for (let i = 0; i < 5; i++) s += jan(f, (3 + i * 5.2) * k, 3.6 * k, 4.4 * k, 7.6 * k, "#bfe9ff");
  return s;
}

const ITENS = {
  predio: function (x, y, r) {
    const a = 13 + Math.floor(r() * 7), h = 34 + Math.floor(r() * 44), modo = r() < .45 ? "faixa" : "grade";
    let s = pad(x, y, a, a) + caixa(x, y, a, a, h) + fachadas(x, y, a, a, h, r, modo);
    if (r() < .4) s += teto(x, y - h, a, r, 40 + r() * 24);
    return s;
  },
  torre: function (x, y, r) {
    const a = 16, h1 = 44 + Math.floor(r() * 14), h2 = 28 + Math.floor(r() * 14), b = a * .66;
    return pad(x, y, a, a) + caixa(x, y, a, a, h1) + fachadas(x, y, a, a, h1, r, "faixa") +
      caixa(x, y - h1, b, b, h2) + fachadas(x, y - h1, b, b, h2, r, "faixa") +
      teto(x, y - h1 - h2, b, r, 56 + r() * 20);
  },
  arvore: function (x, y, r) {
    const k = 7 + Math.floor(r() * 4);
    return caixa(x, y, 3, 3, 6, { esq: "#3b2a20", dir: "#4b3a2e", topo: "#5a4636" }) +
      caixa(x, y - 6, k, k, 9, { esq: "#0f5f4a", dir: "#15803d", topo: "#22a052" }) +
      caixa(x, y - 15, k * .62, k * .62, 6, { esq: "#0f5f4a", dir: "#15803d", topo: "#2fbf67" });
  },
  painel: function (x, y) {
    const w = 17, cy = y - 12;
    let s = caixa(x, y, 2, 2, 11, { esq: "#5b6b94", dir: "#7c8db5", topo: "#9fb0d6" });
    s += caixa(x, y - 10, w, w, 2, { esq: "#0a1a4d", dir: "#12306f", topo: "#0b1f5c" });
    const N = [x, cy - w / 2], E = [x + w, cy], S = [x, cy + w / 2], W = [x - w, cy];
    const m = function (a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
    let d = "";
    [1 / 3, 2 / 3].forEach(function (t) {
      const a = m(N, W, t), b = m(E, S, t), c = m(N, E, t), e = m(W, S, t);
      d += "M" + a[0].toFixed(1) + "," + a[1].toFixed(1) + "L" + b[0].toFixed(1) + "," + b[1].toFixed(1) +
        "M" + c[0].toFixed(1) + "," + c[1].toFixed(1) + "L" + e[0].toFixed(1) + "," + e[1].toFixed(1);
    });
    s += Pol([N, E, m(E, S, .5), m(N, W, .5)], "#22d3ee", ' fill-opacity=".14"');
    s += '<path d="' + d + '" fill="none" stroke="#22d3ee" stroke-opacity=".7" stroke-width=".8"/>';
    return s;
  },
  semaforo: function (x, y) {
    const c = { esq: "#5b6b94", dir: "#7c8db5", topo: "#9fb0d6" };
    let s = caixa(x, y, 2, 2, 24, c) + caixa(x, y - 24, 5, 5, 13, { esq: "#070d24", dir: "#0e1a44", topo: "#1b2a5c" });
    const f = faces(x, y - 24, 5, 5)[1];
    s += jan(f, 1.4, 2.4, 2, 4.6, "#4ade80").replace("<polygon", '<polygon class="sem-b"');
    s += jan(f, 1.4, 2.4, 5.4, 8, "#facc15");
    s += jan(f, 1.4, 2.4, 8.8, 11.4, "#ef4444").replace("<polygon", '<polygon class="sem-a"');
    return s;
  },
  hospital: function (x, y) {
    const a = 22, h = 46;
    let s = pad(x, y, a, a) + caixa(x, y, a, a, h) + fachadas(x, y, a, a, h, function () { return .7; }, "grade");
    const f = faces(x, y, a, a)[1];
    s += jan(f, 6, 10, 21, 31, "#0a1a4d");
    s += jan(f, 9, 4, 17, 35, "#e8f1ff") + jan(f, 6, 10, 23, 29, "#e8f1ff");
    return s;
  },
  garagem: function (x, y) {
    const da = 28, db = 20, h = 20;
    const f = faces(x, y, da, db)[0];
    return pad(x, y, da, db) + caixa(x, y, da, db, h) +
      jan(f, 3.5, 21, 0, 14, "#22d3ee") + jan(f, 5, 18, 0, 12, "#050b22") +
      jan(f, 5, 18, h - 4.5, h - 2.5, "#22d3ee");
  },
  /* quarteirão: laje isométrica com prédios, rua, carro/ônibus e árvores (como a cidade de referência) */
  bloco: function (x, y, r, D) {
    const t = 7, k = D / 54, ox = x, oy = y - t - D / 2;
    const pos = function (p, q) { return [ox + (p - q) * D, oy + (p + q) * D / 2]; };
    let s = '<ellipse cx="' + x + '" cy="' + (y + 4) + '" rx="' + (D * 1.4).toFixed(1) + '" ry="' + (D * .85).toFixed(1) + '" fill="url(#gBrilho)"/>';
    s += caixa(x, y, D, D, t, { esq: "#0a1a4d", dir: "#0d2461", topo: "#183a86" });
    s += Pol([pos(.03, .6), pos(.97, .6), pos(.97, .84), pos(.03, .84)], "#081540");
    const l1 = pos(.06, .72), l2 = pos(.94, .72);
    s += '<line x1="' + l1[0].toFixed(1) + '" y1="' + l1[1].toFixed(1) + '" x2="' + l2[0].toFixed(1) + '" y2="' + l2[1].toFixed(1) +
      '" stroke="#ffffff" stroke-opacity=".4" stroke-width="1" stroke-dasharray="4 4"/>';
    const fator = .65 + .35 * k, garagem = r() < .5;
    const alturas = [0, 1, 2].map(function () { return Math.round((22 + r() * 44) * fator); });
    const maior = alturas.indexOf(Math.max.apply(null, alturas));
    [.2, .5, .8].forEach(function (p, i) {
      const c = pos(p, .3), a = Math.round(D * (.2 + r() * .05)), h = alturas[i];
      if (i === 1 && garagem) { s += ITENS.garagem(c[0], c[1], r).replace(/^/, ""); return; }
      s += caixa(c[0], c[1], a, a, h) + fachadas(c[0], c[1], a, a, h, r, r() < .5 ? "faixa" : "grade");
      if (i === maior) s += teto(c[0], c[1] - h, a, r, 38 + r() * 20);
    });
    const v1 = pos(r() < .5 ? .3 : .68, .72);
    s += r() < .5 ? onibusIso(v1[0], v1[1], k) : carroIso(v1[0], v1[1], k, Math.floor(r() * 4));
    const v2 = pos(.12 + r() * .1, .72);
    if (Math.abs(v2[0] - v1[0]) > 22 * k) s += carroIso(v2[0], v2[1], k, Math.floor(r() * 4));
    const t1 = pos(.16, .94), t2 = pos(.86, .94);
    s += ITENS.arvore(t1[0], t1[1], r) + ITENS.arvore(t2[0], t2[1], r);
    return s;
  }
};

function desenharMapa() {
  const L = estreito.matches ? LAYOUTS.estreito : LAYOUTS.largo;
  const meuId = ++desenhoId;
  const elMapa = $("mapa");
  elMapa.innerHTML = "";
  elMapa.style.aspectRatio = L.W + " / " + L.H;

  const svg = criarSVG("svg", { viewBox: "0 0 " + L.W + " " + L.H, "class": "cena", "aria-hidden": "true" });
  const gFundo = criarSVG("g", {}), gDecor = criarSVG("g", {}), gRua = criarSVG("g", {}), gCarros = criarSVG("g", {});
  [gFundo, gDecor, gRua, gCarros].forEach(function (g) { svg.appendChild(g); });
  elMapa.appendChild(svg);

  /* degradês do cenário (feixes de luz e brilho sob os quarteirões) */
  const defs = criarSVG("defs", {});
  defs.innerHTML = '<linearGradient id="gFeixe" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#22d3ee" stop-opacity=".6"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></linearGradient>' +
    '<radialGradient id="gBrilho"><stop offset="0" stop-color="#22d3ee" stop-opacity=".22"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient>';
  svg.insertBefore(defs, svg.firstChild);

  /* chão isométrico: linhas discretas com inclinação 1:2 nos dois sentidos */
  let gd = "";
  for (let c = -L.W / 2; c < L.H; c += 60) gd += "M0," + c + "L" + L.W + "," + (c + L.W / 2);
  for (let c = 0; c < L.H + L.W / 2; c += 60) gd += "M0," + c + "L" + L.W + "," + (c - L.W / 2);
  gFundo.innerHTML = '<path d="' + gd + '" fill="none" stroke="#22d3ee" stroke-opacity=".06" stroke-width="1"/>';

  /* avenida principal: um trecho entre cada par de regiões */
  const segs = [];
  for (let i = 0; i < 4; i++) {
    const a = L.pts[i], b = L.pts[i + 1];
    const cx = L.vert ? [a[0], a[1] + (b[1] - a[1]) / 2, b[0], a[1] + (b[1] - a[1]) / 2] : [a[0] + (b[0] - a[0]) / 2, a[1], a[0] + (b[0] - a[0]) / 2, b[1]];
    const d = "M" + a[0] + "," + a[1] + " C" + cx[0] + "," + cx[1] + " " + cx[2] + "," + cx[3] + " " + b[0] + "," + b[1];
    ["rua-b", "rua-a", "rua-f"].concat(salvo.concluidas.indexOf(REGIOES[i].id) >= 0 ? ["trilha"] : []).forEach(function (c) {
      gRua.appendChild(criarSVG("path", { d: d, "class": c }));
    });
    segs.push(gRua.querySelector("path:nth-last-of-type(1)"));
  }
  const trechos = Array.prototype.slice.call(gRua.querySelectorAll(".rua-a"));

  const via = [];
  trechos.forEach(function (p) {
    const len = p.getTotalLength();
    for (let s = 0; s <= len; s += 14) { const q = p.getPointAtLength(s); via.push([q.x, q.y]); }
  });

  /* cidade isométrica: quarteirões, prédios com feixe de luz, árvores, painéis, semáforos... fora das ruas e dos cartões */
  const rnd = rng(11), itens = [], ocup = [], blocos = [];
  const D = L.vert ? 38 : 54, ALTO = L.vert ? 50 : 70, FRENTE = L.vert ? 42 : 62;
  const ALT = { torre: 90, predio: 66, hospital: 50, garagem: 22, arvore: 28, painel: 14, semaforo: 34 };
  function livre(x, y, folga, alto) {
    if (x < 14 || x > L.W - 44 || y < 50 || y > L.H - 8) return false;
    if (Math.hypot(x - L.W * (L.vert ? .925 : .955), y - L.H * (L.vert ? .965 : .925)) < 48) return false; /* NPC secreto */
    if (via.some(function (p) { return Math.hypot(p[0] - x, p[1] - y) < folga; })) return false;
    /* prédio alto não pode esconder a avenida atrás dele */
    if (alto && [alto * .5, alto].some(function (dy) { return via.some(function (p) { return Math.hypot(p[0] - x, p[1] - (y - dy)) < 24; }); })) return false;
    if (ocup.some(function (o) { return Math.hypot(o[0] - x, o[1] - y) < folga * .85; })) return false;
    /* área de um quarteirão: a laje e o vulto dos prédios acima dela, mais o que cobriria a frente dela */
    if (blocos.some(function (q) { return Math.abs(q[0] - x) < D + 12 && y > q[1] - D * .5 - ALTO && y < q[1] + D * .5 + FRENTE; })) return false;
    return !L.pts.some(function (p) { return Math.abs(p[0] - x) < 115 && y > p[1] - 200 && y < p[1] + 40; });
  }
  function colocar(tipo, x, y) { ocup.push([x, y]); itens.push({ y: y, s: ITENS[tipo](x, y, rnd) }); }
  /* quarteirões (as lajes com prédios, rua e carros) */
  const amostras = [[0, 0], [.9, 0], [-.9, 0], [0, .45], [0, -.45]];
  for (let k = 0, n = 0; k < 3000 && n < (L.vert ? 3 : 5); k++) {
    const x = D + rnd() * (L.W - 2 * D - 40), y = 90 + rnd() * (L.H - 130);
    const ok = !ocup.some(function (o) { return Math.abs(o[0] - x) < D + 12 && o[1] > y - D * .5 - ALTO && o[1] < y + D * .5 + FRENTE; }) &&
      amostras.every(function (o) { return livre(x + o[0] * D, y + o[1] * D, L.vert ? 24 : 30); }) &&
      livre(x, y - D * .45 - 30, 24) && livre(x + D * .5, y - D * .3 - 25, 24) && livre(x - D * .5, y - D * .3 - 25, 24);
    if (ok) { blocos.push([x, y]); itens.push({ y: y, s: ITENS.bloco(x, y, rnd, D) }); n++; }
  }
  L.pts.forEach(function (p, i) {
    REGIOES[i].tema.forEach(function (tipo) {
      for (let k = 0; k < 60; k++) {
        const a = rnd() * 6.283, d = 60 + rnd() * 100, x = p[0] + Math.cos(a) * d, y = p[1] + Math.sin(a) * d;
        if (livre(x, y, 36, ALT[tipo])) { colocar(tipo, x, y); break; }
      }
    });
  });
  const comuns = ["arvore", "arvore", "predio", "painel", "torre", "garagem"];
  for (let k = 0, n = 0; k < 600 && n < (L.vert ? 12 : 22); k++) {
    const x = 20 + rnd() * (L.W - 70), y = 60 + rnd() * (L.H - 80), tipo = comuns[Math.floor(rnd() * comuns.length)];
    if (livre(x, y, 40, ALT[tipo])) { colocar(tipo, x, y); n++; }
  }
  for (let k = 0, n = 0; k < 200 && n < 5; k++) {
    const p = via[Math.floor(rnd() * via.length)];
    if (livre(p[0] + 22, p[1], 16)) { colocar("semaforo", p[0] + 22, p[1]); n++; }
  }
  itens.sort(function (a, b) { return a.y - b.y; });
  gDecor.innerHTML = itens.map(function (i) { return i.s; }).join("");

  /* carros seguindo a avenida */
  if (!semMovimento) {
    const cores = ["#e8f1ff", "#22d3ee", "#facc15", "#f87171"];
    let carros = "";
    trechos.forEach(function (p, i) {
      for (let c = 0; c < 2; c++) {
        const rev = c === 1, dur = 12 + rnd() * 8;
        carros += '<g><rect x="-7" y="1" width="14" height="5" fill="' + cores[(i + c) % 4] + '"/><rect x="-2" y="2" width="5" height="3" fill="#0a1330"/>' +
          '<animateMotion dur="' + dur.toFixed(1) + 's" begin="-' + (rnd() * dur).toFixed(1) + 's" repeatCount="indefinite" rotate="' + (rev ? "auto-reverse" : "auto") + '"' +
          (rev ? ' keyPoints="1;0" keyTimes="0;1" calcMode="linear"' : "") + ' path="' + p.getAttribute("d") + '"/></g>';
      }
    });
    gCarros.innerHTML = carros;
  }

  /* avatar (o mascote) e posição inicial */
  const alvoIdx = REGIOES.findIndex(function (r) { return salvo.concluidas.indexOf(r.id) < 0; });
  const alvo = alvoIdx < 0 ? REGIOES.length - 1 : alvoIdx;
  let de = Math.min(salvo.avatarEm || 0, REGIOES.length - 1);
  if (de > alvo || semMovimento) de = alvo;
  const vaiAndar = de < alvo;
  if (!vaiAndar) recemDesbloqueada = null;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.setAttribute("role", "img");
  avatar.setAttribute("aria-label", "Você está aqui");
  avatar.innerHTML = '<svg class="avatar-svg" viewBox="-1 -1 34 58" aria-hidden="true">' + Mascote.miniatura(true) + "</svg>";
  function pos(x, y) { avatar.style.left = (x / L.W * 100) + "%"; avatar.style.top = (y / L.H * 100) + "%"; }
  pos(L.pts[de][0], L.pts[de][1]);

  /* marcadores e cartões das regiões */
  REGIOES.forEach(function (reg, i) {
    const visual = (vaiAndar && reg.id === recemDesbloqueada) ? "bloqueada" : estadoDe(reg.id);
    const cor = { bloqueada: "#64748b", andamento: "#22d3ee", concluida: "#4ade80" }[visual];
    gRua.appendChild(criarSVG("circle", { cx: L.pts[i][0], cy: L.pts[i][1], r: 9, fill: "#0a1a4d", stroke: cor, "stroke-width": 3 }));
    const n = totalDe(reg.id), fe = feitas(reg.id);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "regiao";
    b.dataset.id = reg.id;
    b.dataset.estado = visual;
    b.style.left = (L.pts[i][0] / L.W * 100) + "%";
    b.style.top = (L.pts[i][1] / L.H * 100) + "%";
    b.setAttribute("aria-label", reg.nome + ", " + fe + " de " + n + ", " + ROTULO[estadoDe(reg.id)].replace(/^\S+ /, ""));
    b.innerHTML = '<span class="reg-topo"><span class="reg-icone">' + reg.icone + '</span><span class="reg-nome">' + reg.nome + "</span></span>" +
      '<span class="reg-info"><span>' + fe + "/" + n + '</span><span class="st">' + ROTULO[visual] + "</span></span>" +
      '<span class="barra"><i style="width:' + (fe / n * 100) + '%"></i></span>';
    b.addEventListener("click", function () {
      if (salvo.desbloqueadas.indexOf(reg.id) < 0) {
        avisar("Região bloqueada. Conclua " + REGIOES[i - 1].nome + " para liberar " + reg.nome + ".");
        return;
      }
      abrirRegiao(reg);
    });
    elMapa.appendChild(b);
  });
  elMapa.appendChild(avatar);

  /* easter egg: um NPC pequenininho escondido no canto do mapa */
  const seg = document.createElement("button");
  seg.type = "button";
  seg.className = "segredo";
  seg.setAttribute("aria-label", "Sinal escondido");
  seg.style.left = (L.vert ? 92.5 : 95.5) + "%";
  seg.style.top = (L.vert ? 96.5 : 92.5) + "%";
  seg.innerHTML = '<svg viewBox="0 0 10 14" aria-hidden="true">' +
    R(2, 0, 6, 2, "#1e4fbf") + R(1, 2, 8, 4, "#1e4fbf") + R(2, 3, 6, 3, "#0a1330") +
    R(3, 4, 1, 1, "#22d3ee", "olho") + R(6, 4, 1, 1, "#22d3ee", "olho") +
    R(1, 6, 8, 5, "#12306f") + R(4, 8, 2, 1, "#22d3ee") + R(2, 11, 2, 3, "#0a1a4d") + R(6, 11, 2, 3, "#0a1a4d") + "</svg>";
  seg.addEventListener("click", function () { abrirSegredo(seg); });
  elMapa.appendChild(seg);

  /* o avatar caminha pela avenida até a próxima região */
  function chegou() {
    if (meuId !== desenhoId) return;
    if (observador) observador.disconnect();
    avatar.classList.remove("andando", "para-esquerda");
    salvo.avatarEm = alvo;
    gravar();
    if (recemDesbloqueada) {
      const b = elMapa.querySelector('[data-id="' + recemDesbloqueada + '"]');
      if (b) {
        b.dataset.estado = "andamento";
        b.querySelector(".st").textContent = ROTULO.andamento;
        b.classList.add("desbloqueando");
        const pin = svg.querySelectorAll("circle")[REGIOES.findIndex(function (r) { return r.id === recemDesbloqueada; })];
        if (pin) pin.setAttribute("stroke", "#22d3ee");
        Som.acerto();
      }
      recemDesbloqueada = null;
    }
  }
  /* marca a região alcançada com um pulso no pino, a cada trecho vencido */
  function pulsarPino(i) {
    const pin = svg.querySelectorAll("circle")[i];
    if (!pin) return;
    pin.classList.remove("pino-pulso");
    void pin.getBoundingClientRect();
    pin.classList.add("pino-pulso");
  }

  /* o boneco só anda enquanto o mapa estiver de fato na tela: se a pessoa ainda
     não chegou aqui, saiu da aba ou rolou a página, a caminhada espera/pausa */
  let mapaNaTela = false;
  let observador = null;
  if (typeof IntersectionObserver === "function") {
    observador = new IntersectionObserver(function (entradas) {
      mapaNaTela = entradas[0].isIntersecting && entradas[0].intersectionRatio >= .25;
    }, { threshold: [0, .25, .6] });
    observador.observe(elMapa);
  }
  function visivel() {
    if (meuId !== desenhoId || telas.mapa.hidden || document.hidden) return false;
    if (observador) return mapaNaTela;
    const r = elMapa.getBoundingClientRect();
    const alturaVisivel = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
    return alturaVisivel > Math.min(r.height, window.innerHeight) * .25;
  }
  function esperarTela(cb) {
    (function checar() {
      if (meuId !== desenhoId) return;
      if (visivel()) { setTimeout(cb, 700); return; } /* deixa a tela terminar de entrar */
      setTimeout(checar, 200);
    })();
  }

  /* percorre um trecho da avenida em passo calmo: no mínimo 2s de caminhada,
     um pouco mais em trechos longos, para dar tempo de ver o boneco andando */
  function andar(i) {
    if (meuId !== desenhoId) return;
    if (i >= alvo) { chegou(); return; }
    const p = trechos[i], len = p.getTotalLength();
    const dur = Math.max(2000, Math.min(4200, len * 8.5));
    let andado = 0, anterior = null;
    let ultimoX = p.getPointAtLength(0).x;
    avatar.classList.add("andando");
    (function passo(t) {
      if (meuId !== desenhoId) return;
      /* fora da tela: congela onde está e fica esperando */
      if (!visivel()) {
        anterior = null;
        avatar.classList.remove("andando");
        requestAnimationFrame(passo);
        return;
      }
      if (anterior === null) { anterior = t; avatar.classList.add("andando"); }
      andado += Math.min(80, t - anterior); /* ignora saltos longos de tempo parado */
      anterior = t;
      const k = Math.min(1, andado / dur);
      /* sai devagar e chega devagar, mas o miolo é em velocidade de caminhada */
      const e = k < .15 ? (k / .15) * (k / .15) * .15
        : k > .85 ? 1 - Math.pow((1 - k) / .15, 2) * .15
        : k;
      const q = p.getPointAtLength(len * e);
      if (Math.abs(q.x - ultimoX) > .4) {
        avatar.classList.toggle("para-esquerda", q.x < ultimoX);
        ultimoX = q.x;
      }
      pos(q.x, q.y);
      if (k < 1) { requestAnimationFrame(passo); return; }
      /* chegou na região seguinte: respira um instante antes do próximo trecho */
      salvo.avatarEm = i + 1;
      gravar();
      pulsarPino(i + 1);
      if (i + 1 >= alvo) { chegou(); return; }
      avatar.classList.remove("andando");
      setTimeout(function () { andar(i + 1); }, 420);
    })(performance.now());
  }
  if (vaiAndar) esperarTela(function () {
    const destino = REGIOES[Math.min(alvo, REGIOES.length - 1)];
    avisar("Seguindo para " + destino.nome + "…");
    andar(de);
  });
  else { salvo.avatarEm = alvo; gravar(); }
}

/* ---------- Modo Ouro: o prêmio de quem achou o easter egg ---------- */
const CHAVE_OURO = "smartcity-ouro";
let ouroAtivo = document.documentElement.classList.contains("modo-ouro");
function atualizarBotaoOuro() { $("ouroDesligar").hidden = !ouroAtivo; }
function redesenharAvatares() {
  $("avatarInicio").innerHTML = Mascote.miniatura();
  const av = document.querySelector("#mapa .avatar-svg");
  if (av) av.innerHTML = Mascote.miniatura(true);
}
function trocarTema(ligar) {
  document.documentElement.classList.toggle("modo-ouro", ligar);
  ouroAtivo = ligar;
  try { if (ligar) localStorage.setItem(CHAVE_OURO, "1"); else localStorage.removeItem(CHAVE_OURO); } catch (e) {}
  Mascote.ouro(ligar);
  redesenharAvatares();
  atualizarBotaoOuro();
}
function liberarOuro(mensagem) {
  if (ouroAtivo) return;
  ouroAtivo = true; /* evita disparar duas vezes seguidas */
  Som.ouro();
  if (semMovimento) {
    trocarTema(true);
    avisar(mensagem || "✨ Modo Ouro Neon desbloqueado!");
    return;
  }
  const flash = $("ouroFlash");
  flash.classList.remove("ativo");
  void flash.offsetWidth;
  flash.classList.add("ativo");
  setTimeout(function () { trocarTema(true); }, 320); /* a troca acontece no pico do flash */
  setTimeout(function () { avisar(mensagem || "✨ Modo Ouro Neon desbloqueado! Tudo brilha em dourado agora."); }, 1000);
  setTimeout(function () { flash.classList.remove("ativo"); }, 1800);
}

/* fim do quiz extra: o dourado sai com o mesmo clarão com que entrou */
function encerrarOuroDepois(espera) {
  setTimeout(function () {
    if (!ouroAtivo) return;
    const aviso = "Quiz extra concluído! Modo Ouro encerrado. Ache o segredo de novo para jogar outra vez.";
    if (semMovimento) {
      trocarTema(false);
      avisar(aviso);
      return;
    }
    const flash = $("ouroFlash");
    flash.classList.remove("ativo");
    void flash.offsetWidth;
    flash.classList.add("ativo");
    setTimeout(function () { trocarTema(false); }, 320);
    setTimeout(function () { avisar(aviso); }, 1000);
    setTimeout(function () { flash.classList.remove("ativo"); }, 1800);
  }, espera || 0);
}
$("ouroDesligar").addEventListener("click", function () { trocarTema(false); avisar("Modo Ouro desativado. Ache o segredo de novo para religar!"); });

/* ---------- easter egg: modal secreto ---------- */
let segredoOcupado = false, segredoGatilho = null;
function abrirSegredo(gatilho) {
  if (segredoOcupado) return;
  segredoOcupado = true;
  segredoGatilho = gatilho;
  const mapa = $("mapa");
  mapa.classList.remove("glitch");
  void mapa.offsetWidth;
  mapa.classList.add("glitch");
  Som.surpresa();
  setTimeout(function () {
    mapa.classList.remove("glitch");
    $("modalSegredo").hidden = false;
    $("segredoFechar").focus();
  }, semMovimento ? 0 : 700);
}
/* jogar = true: abre a fase extra com o Modo Ouro ligado; false: só volta ao mapa */
function fecharSegredo(jogar) {
  $("modalSegredo").hidden = true;
  segredoOcupado = false;
  if (jogar) {
    iniciarExtra();
    liberarOuro("✨ Fase extra desbloqueada! O Modo Ouro fica ligado até o fim do quiz.");
    return;
  }
  if (segredoGatilho && document.body.contains(segredoGatilho)) segredoGatilho.focus();
}
$("segredoFechar").addEventListener("click", function () { fecharSegredo(true); });
$("segredoDepois").addEventListener("click", function () { fecharSegredo(false); });
$("modalSegredo").addEventListener("click", function (e) { if (e.target === this) fecharSegredo(false); });
document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("modalSegredo").hidden) fecharSegredo(false); });

/* ---------- botões e início ---------- */
$("comecar").addEventListener("click", function () { ir("mapa"); });
$("zerar").addEventListener("click", function () {
  if (!confirm("Apagar o XP e o progresso e recomeçar do zero?")) return;
  salvo = novoSave();
  gravar();
  atualizarInicio();
});
$("regVoltar").addEventListener("click", function () { ir("mapa"); });
$("iniciarMissao").addEventListener("click", function () { iniciarMissao(regiaoAtual, estadoDe(regiaoAtual.id) === "concluida"); });
$("voltarMapa").addEventListener("click", function () { ir("mapa"); });
$("fimMapa").addEventListener("click", function () { ir("mapa"); });
$("refazer").addEventListener("click", function () {
  if (extra) { iniciarExtra(); return; }
  if (fimGeral) { salvo = novoSave(); gravar(); ir("mapa"); }
  else iniciarMissao(regiaoAtual, estadoDe(regiaoAtual.id) === "concluida");
});
estreito.addEventListener("change", function () { if (!telas.mapa.hidden) desenharMapa(); });
if (ouroAtivo) Mascote.ouro(true);
atualizarBotaoOuro();
$("avatarInicio").innerHTML = Mascote.miniatura();
ir("inicio");

montarEstrelas();
atualizarSkyline();
montarNuvens();
montarAvioes();
ativarParallax();
Mascote.iniciar();

/* Gráfico interativo: população urbana no Brasil (% do total).
   Sem bibliotecas: desenha um SVG, mostra o valor ao passar o mouse e aceita as setas do teclado. */
(function () {
    var svg = document.getElementById('graficoBrasil');
    if (!svg) return;

    var D = [[1940, 31.2], [1950, 36.2], [1960, 44.7], [1970, 55.9], [1980, 67.6],
             [1991, 75.6], [2000, 81.3], [2010, 84.4], [2022, 87.4]];
    var W = 760, H = 340, L = 46, R = 30, T = 34, B = 40, NS = 'http://www.w3.org/2000/svg';
    var ano = document.getElementById('lAno'), val = document.getElementById('lVal'),
        txt = document.getElementById('lTxt'), med = document.getElementById('medidor');

    function X(a) { return L + (a - 1940) / 82 * (W - L - R); }
    function Y(v) { return T + (100 - v) / 100 * (H - T - B); }
    function E(n, a, p) {
        var e = document.createElementNS(NS, n);
        for (var k in a) e.setAttribute(k, a[k]);
        (p || svg).appendChild(e);
        return e;
    }
    function pct(v) { return v.toFixed(1).replace('.', ',') + '%'; }

    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    var defs = E('defs', {});
    var ga = E('linearGradient', { id: 'gArea', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    E('stop', { offset: '0', 'stop-color': '#05DBFC', 'stop-opacity': 0.4 }, ga);
    E('stop', { offset: '1', 'stop-color': '#05DBFC', 'stop-opacity': 0 }, ga);
    var gl = E('linearGradient', { id: 'gLinha', x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    E('stop', { offset: '0', 'stop-color': '#05DBFC' }, gl);
    E('stop', { offset: '1', 'stop-color': '#00FF88' }, gl);

    // grade e eixos
    [0, 25, 50, 75, 100].forEach(function (v) {
        E('line', { x1: L, x2: W - R, y1: Y(v), y2: Y(v), 'class': v === 50 ? 'g50' : 'gl' });
        E('text', { x: L - 10, y: Y(v) + 4, 'text-anchor': 'end', 'class': 'gt' }).textContent = v + '%';
    });
    E('text', { x: W - R, y: Y(50) - 8, 'text-anchor': 'end', 'class': 'gm' }).textContent = 'metade da população';
    D.forEach(function (d) {
        E('text', { x: X(d[0]), y: H - 12, 'text-anchor': 'middle', 'class': 'gt' }).textContent = d[0];
    });

    // curva suave (Catmull-Rom convertida em Bézier)
    var P = D.map(function (d) { return [X(d[0]), Y(d[1])]; });
    var path = 'M' + P[0][0] + ' ' + P[0][1];
    for (var i = 0; i < P.length - 1; i++) {
        var p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
        path += ' C' + (p1[0] + (p2[0] - p0[0]) / 6) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6) + ' ' +
                       (p2[0] - (p3[0] - p1[0]) / 6) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6) + ' ' + p2[0] + ' ' + p2[1];
    }
    var base = Y(0);
    E('path', { d: path + ' L' + P[P.length - 1][0] + ' ' + base + ' L' + P[0][0] + ' ' + base + ' Z', fill: 'url(#gArea)', 'class': 'area' });
    var linha = E('path', { d: path, stroke: 'url(#gLinha)', 'class': 'linha' });
    var len = linha.getTotalLength();
    linha.style.setProperty('--len', len);

    var guia = E('line', { y1: T - 6, y2: base, 'class': 'guia' });
    var halo = E('circle', { r: 13, 'class': 'halo' });
    var pontos = D.map(function (d, i) {
        var c = E('circle', { cx: P[i][0], cy: P[i][1], r: 5, 'class': 'ponto' });
        E('text', { x: P[i][0], y: P[i][1] - 15, 'class': 'valor' }).textContent = pct(d[1]);
        return c;
    });

    // painel de leitura
    for (var m = 0; m < 10; m++) med.appendChild(document.createElement('span'));

    var atual = -1;
    function sel(i) {
        if (i === atual) return;
        atual = i;
        var a = D[i][0], v = D[i][1], n = Math.round(v / 10);
        ano.textContent = a;
        val.textContent = pct(v);
        txt.textContent = a === 1970
            ? 'Em 1970, pela primeira vez, mais da metade dos brasileiros passou a viver em cidades.'
            : 'Em ' + a + ', cerca de ' + n + ' em cada 10 brasileiros viviam em cidades.';
        Array.prototype.forEach.call(med.children, function (s, k) {
            s.style.setProperty('--f', Math.max(0, Math.min(1, v / 10 - k)) * 100 + '%');
        });
        guia.setAttribute('x1', P[i][0]); guia.setAttribute('x2', P[i][0]);
        halo.setAttribute('cx', P[i][0]); halo.setAttribute('cy', P[i][1]);
        pontos.forEach(function (c, k) { c.setAttribute('r', k === i ? 7.5 : 5); });
    }
    sel(D.length - 1);

    svg.addEventListener('pointermove', function (e) {
        var r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, best = 0;
        for (var i = 1; i < P.length; i++) if (Math.abs(P[i][0] - x) < Math.abs(P[best][0] - x)) best = i;
        sel(best);
    });
    svg.addEventListener('keydown', function (e) {
        var k = { ArrowLeft: atual - 1, ArrowRight: atual + 1, Home: 0, End: D.length - 1 }[e.key];
        if (k === undefined) return;
        e.preventDefault();
        sel(Math.max(0, Math.min(D.length - 1, k)));
    });

    // a curva se desenha uma vez, quando aparece na tela
    var painel = svg.closest('.painelBrasil');
    function mostrar() { painel.classList.add('visivel'); }
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var io = new IntersectionObserver(function (es) {
            if (es[0].isIntersecting) { mostrar(); io.disconnect(); }
        }, { threshold: 0.35 });
        io.observe(painel);
    } else mostrar();
})();

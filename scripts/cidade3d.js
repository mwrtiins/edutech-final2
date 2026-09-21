/* Cidade inteligente em 3D: WebGL puro, sem bibliotecas.
   Arraste para girar, Ctrl + rolagem (ou botões +/−) para aproximar, passe o mouse nos prédios para ver o que fazem. */
(function () {
    var root = document.getElementById('cidade3d');
    if (!root) return;
    var cv = root.querySelector('canvas'), tip = root.querySelector('.c3dTip'), txt = root.querySelector('.c3dTexto');
    var gl = cv.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true });
    function falha() { root.classList.add('sem-webgl'); }
    if (!gl) return falha();

    /* ---------- shaders ---------- */
    var VS = 'attribute vec3 p;attribute vec3 n;uniform mat4 vp;uniform vec3 off,sc;uniform float ang;' +
        'varying vec3 vw,vn,vl;void main(){vl=p+vec3(.5,0.,.5);vec3 q=p*sc;float c=cos(ang),s=sin(ang);' +
        'q.xz=vec2(q.x*c+q.z*s,-q.x*s+q.z*c);vn=vec3(n.x*c+n.z*s,n.y,-n.x*s+n.z*c);vw=q+off;gl_Position=vp*vec4(vw,1.);}';

    var FS = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nvarying vec3 vw,vn,vl;uniform vec3 col,roof,hl,cam,sun;' +
        'uniform float mode,dim,night,t,seed,k;uniform sampler2D tex;' +
        'float H(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453);}' +
        'void main(){vec3 N=normalize(vn),V=normalize(cam-vw);' +
        'if(mode>5.5){gl_FragColor=vec4(col*(1.+night*.8)+hl*k,1.);return;}' +
        'if(mode>4.5){float a=(1.-vl.y)*(.5+.2*sin(t*3.));gl_FragColor=vec4(vec3(.02,.86,.99)*a,a*.5);return;}' +
        'if(mode>3.5){gl_FragColor=vec4(0.,0.,0.,texture2D(tex,vl.xz).a*.3);return;}' +
        'if(mode>2.5){vec2 u=vl.xy;float e=min(min(u.x,1.-u.x)*1.6,u.y*2.6);e=min(e,min(u.y,1.-u.y)*2.6);' +
        'float b=1.-smoothstep(.0,.05,e);float c=u.x*9.;float bar=step(.12,fract(c))*step(fract(c),.88)*step(u.y,.18+.62*H(vec2(floor(c),seed)))*step(.14,u.y);' +
        'float sc2=smoothstep(.06,0.,abs(fract(u.y*1.-t*.25)-.5)-.44)*.25;' +
        'float a=.16+b*.75+bar*.5+sc2;gl_FragColor=vec4(vec3(.02,.86,.99)*a,a);return;}' +
        'float fr=pow(1.-max(dot(N,V),0.),3.);vec3 c=N.y>.5?roof:col;float em=0.;' +
        'if(abs(N.y)<.5&&mode>.5&&mode<2.5){float u=abs(N.x)>.5?vw.z:vw.x;vec2 g=vec2(u*2.4,vw.y*2.4),f=fract(g),i=floor(g);' +
        'float w=step(.1,f.x)*step(f.x,.9)*step(.14,f.y)*step(f.y,.86);if(mode>1.5)w*=step(.26,f.x)*step(f.x,.74);' +
        'float lit=step(.5,H(i+seed));' +
        'if(mode<1.5){vec3 sky=mix(vec3(.1,.3,.62),vec3(.5,.85,1.),clamp(vw.y/9.,0.,1.)*.5+fr*.7);c=mix(vec3(.04,.14,.38),sky,w);}' +
        'else c=mix(col,vec3(.17,.36,.66),w);em=w*lit*night;c=mix(c,vec3(1.,.85,.5),em*.9);}' +
        'float dif=max(dot(N,sun),0.);float li=mix(.5+.22*N.y+.55*dif,.2+.14*N.y+.1*dif,night);' +
        'vec3 o=mix(c*li,c,em);if(mode>.5&&mode<1.5)o+=fr*.2*vec3(.5,.8,1.)*(1.-night*.5);' +
        'o=mix(o,vec3(dot(o,vec3(.33)))*.55,dim);o+=hl*k*(.6+fr);gl_FragColor=vec4(o,1.);}';

    function sh(type, src) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
        return s;
    }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return falha();
    var pr = gl.createProgram();
    gl.attachShader(pr, vs); gl.attachShader(pr, fs);
    gl.bindAttribLocation(pr, 0, 'p'); gl.bindAttribLocation(pr, 1, 'n');
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return falha();
    gl.useProgram(pr);
    var U = {};
    'vp off sc ang col roof hl cam sun mode dim night t seed k tex'.split(' ').forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });

    /* ---------- malhas ---------- */
    function mesh(v, i) {
        var vb = gl.createBuffer(), ib = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(i), gl.STATIC_DRAW);
        return { vb: vb, ib: ib, n: i.length };
    }
    var FACES = [[[0, 0, 1], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], [[0, 0, -1], [1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]],
                 [[1, 0, 0], [1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], [[-1, 0, 0], [0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]],
                 [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], [[0, -1, 0], [0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]];
    var bv = [], bi = [];
    FACES.forEach(function (f, j) {
        for (var c = 1; c < 5; c++) bv.push(f[c][0] - .5, f[c][1], f[c][2] - .5, f[0][0], f[0][1], f[0][2]);
        bi.push(j * 4, j * 4 + 1, j * 4 + 2, j * 4, j * 4 + 2, j * 4 + 3);
    });
    var BOX = mesh(bv, bi);

    function prism(seg, top) {
        var v = [], ix = [], a, b, i;
        for (i = 0; i < seg; i++) {
            a = i / seg * 6.2832; b = (i + 1) / seg * 6.2832;
            var o = v.length / 6;
            v.push(Math.cos(a) * .5, 0, Math.sin(a) * .5, Math.cos(a), .35, Math.sin(a),
                   Math.cos(b) * .5, 0, Math.sin(b) * .5, Math.cos(b), .35, Math.sin(b),
                   Math.cos(b) * .5 * top, 1, Math.sin(b) * .5 * top, Math.cos(b), .35, Math.sin(b),
                   Math.cos(a) * .5 * top, 1, Math.sin(a) * .5 * top, Math.cos(a), .35, Math.sin(a));
            ix.push(o, o + 1, o + 2, o, o + 2, o + 3);
        }
        var c0 = v.length / 6;
        v.push(0, 1, 0, 0, 1, 0);
        for (i = 0; i <= seg; i++) v.push(Math.cos(i / seg * 6.2832) * .5 * top, 1, Math.sin(i / seg * 6.2832) * .5 * top, 0, 1, 0);
        for (i = 0; i < seg; i++) ix.push(c0, c0 + 1 + i, c0 + 2 + i);
        return mesh(v, ix);
    }
    var CYL = prism(10, 1), CONE = prism(10, .08);

    // textura da sombra suave
    var tx = gl.createTexture(), td = new Uint8Array(64 * 64 * 4);
    for (var yy = 0; yy < 64; yy++) for (var xx = 0; xx < 64; xx++) {
        var d = Math.min(1, Math.min(xx, yy, 63 - xx, 63 - yy) / 18);
        td[(yy * 64 + xx) * 4 + 3] = 255 * d * d * (3 - 2 * d);
    }
    gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, td);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(U.tex, 0);

    /* ---------- cena ---------- */
    var LC = { mobilidade: [.02, .86, .99], energia: [1, .78, .25], dados: [.5, .55, 1], verde: [0, 1, .53] };
    var TXT = {
        todos: 'Passe o mouse nos prédios, ruas e praças para ver como a tecnologia ajuda a cidade.',
        mobilidade: 'Semáforos, transporte e recarga conectados fazem a cidade andar melhor.',
        energia: 'Painéis solares e sensores ajudam a gastar menos energia.',
        dados: 'Sensores enviam informações para um centro que ajuda a decidir.',
        verde: 'Áreas verdes com sensores cuidam da água e do ambiente.'
    };
    var GLASS = [.1, .25, .55], WHITE = [.94, .96, .99], GREY = [.8, .84, .9], GREEN = [.28, .78, .44], LAWN = [.3, .74, .42];
    var S = [], PICK = [];
    function box(x0, z0, x1, z1, h, o) {
        o.x = (x0 + x1) / 2; o.z = (z0 + z1) / 2; o.w = x1 - x0; o.d = z1 - z0; o.h = h; o.y = o.y || 0;
        o.roof = o.roof || o.c; o.seed = S.length * 7.3;
        S.push(o); if (o.n) PICK.push(o); return o;
    }
    // base
    box(-6.3, -6.3, 6.3, 6.3, .3, { c: [.12, .24, .5], y: -.95, mesh: BOX });
    box(-6.3, -6.3, 6.3, 6.3, .65, { c: [.72, .78, .88], roof: [.9, .93, .97], y: -.65, mesh: BOX });
    // ruas e calçadas
    var ROAD = [.13, .16, .23], WALK = [.8, .84, .9];
    [[-6.3, 1.5, 6.3, 1.7], [-6.3, 3.1, 6.3, 3.3], [-1.2, -6.3, -1, 1.5], [.3, -6.3, .5, 1.5]].forEach(function (r) { box(r[0], r[1], r[2], r[3], .09, { c: WALK }); });
    box(-6.3, 1.7, 6.3, 3.1, .06, { c: ROAD, l: 'mobilidade', n: 'Avenida com semáforos inteligentes', t: 'Os semáforos mudam o tempo do sinal conforme o trânsito, para reduzir filas.', ph: .5 });
    box(-1, -6.3, .3, 1.7, .06, { c: ROAD, l: 'mobilidade' });
    for (var i = -6; i < 6; i += .9) box(i, 2.37, i + .45, 2.43, .01, { c: WHITE, y: .06 });
    for (i = -6; i < 1.4; i += .9) box(-.38, i, -.32, i + .45, .01, { c: WHITE, y: .06 });
    // gramados
    var L1 = box(3.7, -1.6, 5.9, .5, .05, { c: LAWN, l: 'verde', n: 'Praça com sensores', t: 'Sensores medem a umidade do solo e a irrigação liga só quando precisa.', ph: .9 });
    box(4.8, -5.6, 5.9, -1.9, .05, { c: LAWN, l: 'verde' });
    box(.6, 3.5, 2.0, 5.8, .05, { c: LAWN, l: 'verde', n: 'Parque urbano', t: 'Áreas verdes e um lago ajudam a controlar o calor e a água da chuva.', ph: .9 });
    box(.9, 4.4, 1.7, 5.4, .02, { c: [.3, .65, .92], y: .05, l: 'verde' });
    box(4.9, 4.3, 5.9, 5.8, .05, { c: LAWN, l: 'verde' });
    // torres de vidro
    box(-5.6, -5.4, -4.1, -3.9, 7.4, { c: GLASS, m: 1, l: 'energia', n: 'Torre com edifício inteligente', t: 'Sensores ajustam luz e ar-condicionado e reduzem o gasto de energia.' });
    box(-3.7, -5.6, -2.3, -4.2, 5.4, { c: GLASS, m: 1 });
    box(-5.5, -3.4, -4, -2, 4, { c: GLASS, m: 1 });
    var TW = box(-3.5, -3.6, -2, -2.1, 6.4, { c: GLASS, m: 1, l: 'dados', n: 'Centro de dados da cidade', t: 'Recebe as informações dos sensores e ajuda a prefeitura a tomar decisões.' });
    box(-2.83, -2.93, -2.67, -2.77, 1.3, { c: WHITE, y: 6.4 });
    box(-5.5, -1.3, -3.8, .3, 2.5, { c: WHITE, m: 2, roof: GREY });
    box(-3.3, -1.2, -1.7, .4, 1.6, { c: WHITE, m: 2, roof: GREEN, l: 'verde', n: 'Telhado verde', t: 'As plantas no telhado diminuem o calor e absorvem a água da chuva.' });
    // prédios claros
    box(.9, -5.5, 2.5, -4, 3, { c: WHITE, m: 2, roof: GREEN });
    box(3, -5.5, 4.6, -4.1, 2.2, { c: WHITE, m: 2, roof: GREY });
    box(1, -3.5, 2.4, -2.1, 3.7, { c: GLASS, m: 1 });
    box(2.9, -3.6, 4.5, -2.1, 2, { c: WHITE, m: 2, roof: GREY });
    box(1.2, -1.4, 3.4, .3, 1.2, { c: WHITE, m: 2, roof: [.1, .22, .5], l: 'energia', n: 'Prédio com painéis solares', t: 'Os painéis no telhado transformam a luz do sol em energia limpa.' });
    box(-5.6, 3.7, -4, 5.3, 5, { c: GLASS, m: 1 });
    box(-3.5, 3.8, -1.8, 5.4, 2.8, { c: WHITE, m: 2, roof: GREY });
    box(2.3, 3.9, 4.3, 5.3, 1.2, { c: GLASS, m: 1, roof: [.3, .9, 1], l: 'mobilidade', n: 'Estação de mobilidade', t: 'Mostra horários e lotação dos ônibus em tempo real.' });
    box(4.6, 3.6, 5, 3.9, .5, { c: [.05, .8, .95], roof: [.5, 1, .9], l: 'mobilidade', n: 'Ponto de recarga', t: 'Carros elétricos recarregam aqui, usando energia da rede inteligente.', ph: .8 });
    box(5.2, 3.6, 5.6, 3.9, .5, { c: [.05, .8, .95], roof: [.5, 1, .9], l: 'mobilidade' });
    // árvores e postes
    [[4.2, -1.2], [5.4, -.6], [4.8, 0], [5.5, -1.3], [5.3, -3.4], [5.4, -4.6], [5.1, -2.5], [.8, 3.8], [1.85, 3.8], [1.85, 5.6], [.8, 5.6], [5.2, 4.7], [5.6, 5.3], [5.6, 4.5]].forEach(function (p, j) {
        S.push({ mesh: CYL, x: p[0], z: p[1], w: .12, d: .12, h: .35, y: .05, c: [.4, .27, .17], l: 'verde' });
        S.push({ mesh: CONE, x: p[0], z: p[1], w: .8, d: .8, h: 1.1 + (j % 3) * .15, y: .3, c: j % 2 ? [.16, .62, .36] : [.22, .72, .4], l: 'verde' });
    });
    [[-4, 1.6], [-2, 1.6], [2.2, 1.6], [4.6, 1.6], [-3, 3.2], [1, 3.2], [3.5, 3.2]].forEach(function (p) {
        S.push({ mesh: CYL, x: p[0], z: p[1], w: .07, d: .07, h: 1.1, y: .07, c: [.25, .3, .4], l: 'mobilidade' });
        S.push({ mesh: BOX, x: p[0], z: p[1], w: .28, d: .12, h: .07, y: 1.15, c: [1, .95, .75], m: 6, l: 'mobilidade' });
    });
    var CARS = [[0, 2.05, 1, 1.3, [.05, .86, .99]], [7, 2.05, 1, 1.3, [1, 1, 1]], [3, 2.75, -1, 1.1, [1, .8, .3]], [9, 2.75, -1, 1.1, [.5, .55, 1]],
                [0, -.65, 1, .9, [1, 1, 1]], [4, -.05, -1, 1, [.05, .86, .99]]];

    /* ---------- estado e câmera ---------- */
    var az = .78, el = .6, dist = 40, TG = [0, 1.1, 0], auto = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    var layer = 'todos', night = 0, nt = 0, hover = null, drag = null, T = 0, last = 0, asp = 1, vis = true, run = false;
    var SUN = [.62, .75, .22], FOV = .5, basis = null, eye = [0, 0, 0];

    function persp(f, a, n, r) { var t = 1 / Math.tan(f / 2); return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (r + n) / (n - r), -1, 0, 0, 2 * r * n / (n - r), 0]; }
    function mul(a, b) { var o = []; for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; }
    function nrm(v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
    function crs(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
    function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
    function look(e, c) {
        var z = nrm([e[0] - c[0], e[1] - c[1], e[2] - c[2]]), x = nrm(crs([0, 1, 0], z)), y = crs(z, x);
        basis = { r: x, u: y, f: [-z[0], -z[1], -z[2]] };
        return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1];
    }

    /* ---------- desenho ---------- */
    var bound = null;
    function use(m) {
        if (bound === m) return; bound = m;
        gl.bindBuffer(gl.ARRAY_BUFFER, m.vb); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ib);
        gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
        gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
    }
    // estado de destaque: camada escolhida, item sob o mouse
    function look3(l, it) {
        var hl = [0, 0, 0], k = 0, dim = 0;
        if (layer !== 'todos') { if (l === layer) { hl = LC[layer]; k = .18 + .1 * Math.sin(T * 3); } else dim = .5; }
        if (it && it === hover) { hl = [.1, .9, 1]; k = .32; dim = 0; }
        return [hl, k, dim];
    }
    function D(m, x, y, z, w, h, d, c, roof, mode, ang, seed, l, it) {
        use(m);
        var s = look3(l, it);
        gl.uniform3f(U.off, x, y, z); gl.uniform3f(U.sc, w, h, d); gl.uniform1f(U.ang, ang || 0);
        gl.uniform3fv(U.col, c); gl.uniform3fv(U.roof, roof || c); gl.uniform1f(U.mode, mode || 0);
        gl.uniform1f(U.seed, seed || 0); gl.uniform3fv(U.hl, s[0]); gl.uniform1f(U.k, s[1]); gl.uniform1f(U.dim, s[2]);
        gl.drawElements(gl.TRIANGLES, m.n, gl.UNSIGNED_SHORT, 0);
    }

    function frame(ts) {
        if (!vis || document.hidden) { run = false; return; }
        var dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; T = ts / 1000;
        if (auto && !drag) az += dt * .14;
        night += (nt - night) * .08;
        var w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
        if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
        asp = w / h;
        eye = [TG[0] + dist * Math.cos(el) * Math.sin(az), TG[1] + dist * Math.sin(el), TG[2] + dist * Math.cos(el) * Math.cos(az)];
        var vp = mul(persp(FOV, asp, 2, 90), look(eye, TG));

        gl.viewport(0, 0, cv.width, cv.height);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.depthMask(true);
        gl.uniformMatrix4fv(U.vp, false, vp); gl.uniform3fv(U.cam, eye); gl.uniform3fv(U.sun, nrm(SUN));
        gl.uniform1f(U.night, night); gl.uniform1f(U.t, T);
        bound = null;

        S.forEach(function (o) { D(o.mesh || BOX, o.x, o.y, o.z, o.w, o.h, o.d, o.c, o.roof, o.m, 0, o.seed, o.l, o); });
        CARS.forEach(function (c) {
            var ax = c[1] > 0, len = ax ? 12.6 : 7.8, m = (c[0] + T * c[3]) % len, v = -6.3 + (c[2] > 0 ? m : len - m);
            var x = ax ? v : c[1], z = ax ? c[1] : v, sx = ax ? .62 : .3, sz = ax ? .3 : .62;
            D(BOX, x, .06, z, sx, .2, sz, c[4], c[4], 0, 0, 0, 'mobilidade');
            D(BOX, x, .26, z, sx * .55, .14, sz * .8, [.85, .92, 1], [.85, .92, 1], 0, 0, 0, 'mobilidade');
        });

        // transparentes: sombras, feixe de luz e painéis holográficos
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
        var none = [0, 0, 0];
        S.forEach(function (o) {
            if (o.y > .3 || o.h < .8 || o.mesh) return;
            var e = .5 + o.h * .16;
            D(BOX, o.x - o.h * .3, .1, o.z - o.h * .11, o.w + e, .001, o.d + e, none, none, 4);
        });
        D(BOX, TW.x, TW.h + 1.3, TW.z, .3, 3.2, .3, [1, 1, 1], null, 5, az);
        [[-.6, 6.3, -3.4, 2.4, 1.4, 1.5], [2.8, 4.4, -.9, 2, 1.2, 4.2], [3.5, 3.1, 3.4, 1.7, 1, 8.8]].forEach(function (p, j) {
            D(BOX, p[0], p[1] + .15 * Math.sin(T * 1.3 + j * 2), p[2], p[3], p[4], .02, [1, 1, 1], null, 3, az, p[5]);
        });
        gl.depthMask(true);
        requestAnimationFrame(frame);
    }
    function start() { if (!run) { run = true; last = 0; requestAnimationFrame(frame); } }

    /* ---------- interação ---------- */
    function ray(cx, cy) {
        var r = cv.getBoundingClientRect(), nx = (cx - r.left) / r.width * 2 - 1, ny = 1 - (cy - r.top) / r.height * 2, t = Math.tan(FOV / 2), d = [0, 0, 0];
        for (var i = 0; i < 3; i++) d[i] = basis.f[i] + nx * t * asp * basis.r[i] + ny * t * basis.u[i];
        return nrm(d);
    }
    function pick(cx, cy) {
        if (!basis) return null;
        var d = ray(cx, cy), best = null, bt = 1e9;
        PICK.forEach(function (o) {
            var lo = [o.x - o.w / 2, o.y, o.z - o.d / 2], hi = [o.x + o.w / 2, o.y + (o.ph || o.h), o.z + o.d / 2], t0 = 0, t1 = 1e9;
            for (var i = 0; i < 3; i++) {
                if (Math.abs(d[i]) < 1e-6) { if (eye[i] < lo[i] || eye[i] > hi[i]) return; continue; }
                var a = (lo[i] - eye[i]) / d[i], b = (hi[i] - eye[i]) / d[i];
                t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b));
            }
            if (t0 <= t1 && t0 < bt) { bt = t0; best = o; }
        });
        return best;
    }
    function setHover(o, e) {
        hover = o;
        cv.style.cursor = drag ? 'grabbing' : (o ? 'pointer' : 'grab');
        if (!o) { tip.hidden = true; return; }
        tip.querySelector('b').textContent = o.n; tip.querySelector('span').textContent = o.t; tip.hidden = false;
        var r = root.getBoundingClientRect();
        tip.style.left = Math.min(r.width - tip.offsetWidth - 8, Math.max(8, e.clientX - r.left + 14)) + 'px';
        tip.style.top = Math.max(8, e.clientY - r.top - tip.offsetHeight - 14) + 'px';
    }
    cv.addEventListener('pointerdown', function (e) {
        drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId);
        auto = false; girar.setAttribute('aria-pressed', 'false'); setHover(null); cv.style.cursor = 'grabbing';
    });
    cv.addEventListener('pointermove', function (e) {
        if (drag) {
            az -= (e.clientX - drag.x) * .008; el = Math.max(.15, Math.min(1.3, el + (e.clientY - drag.y) * .006));
            drag.x = e.clientX; drag.y = e.clientY;
        } else setHover(pick(e.clientX, e.clientY), e);
    });
    function solta() { drag = null; cv.style.cursor = 'grab'; }
    cv.addEventListener('pointerup', solta); cv.addEventListener('pointercancel', solta);
    cv.addEventListener('pointerleave', function () { if (!drag) setHover(null); });
    cv.addEventListener('wheel', function (e) {
        if (!(e.ctrlKey || e.metaKey)) return;
        e.preventDefault(); zoom(1 + e.deltaY * .002);
    }, { passive: false });
    function zoom(f) { dist = Math.max(16, Math.min(52, dist * f)); }

    var girar = root.querySelector('#c3dGirar'), noite = root.querySelector('#c3dNoite');
    girar.addEventListener('click', function () { auto = !auto; girar.setAttribute('aria-pressed', auto); });
    girar.setAttribute('aria-pressed', auto);
    noite.addEventListener('click', function () { nt = nt ? 0 : 1; noite.setAttribute('aria-pressed', !!nt); noite.textContent = nt ? 'Dia' : 'Noite'; });
    root.querySelector('#c3dMais').addEventListener('click', function () { zoom(.85); });
    root.querySelector('#c3dMenos').addEventListener('click', function () { zoom(1.18); });
    Array.prototype.forEach.call(root.querySelectorAll('[data-camada]'), function (b) {
        b.addEventListener('click', function () {
            layer = b.getAttribute('data-camada'); txt.textContent = TXT[layer];
            Array.prototype.forEach.call(root.querySelectorAll('[data-camada]'), function (o) { o.setAttribute('aria-pressed', o === b); });
        });
    });
    txt.textContent = TXT.todos;

    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) start(); }).observe(root);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
    cv.style.cursor = 'grab';
    start();
})();

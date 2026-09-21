/* Linha do tempo interativa: clique em uma época para abri-la em foco.
   O conteúdo vem da própria página (ano, título, texto e foto de cada .timelineItem). */
(function () {
    var itens = Array.prototype.slice.call(document.querySelectorAll('.timelineItem'));
    if (!itens.length) return;

    var localEl = document.querySelector('.cardTransformacao h3');
    var local = localEl ? localEl.textContent.trim() : '';

    var epocas = itens.map(function (el) {
        var img = el.querySelector('.colunaImagem img');
        return {
            ano: el.querySelector('.ano').textContent.trim(),
            titulo: el.querySelector('h4').textContent.trim(),
            texto: el.querySelector('.colunaTexto p').textContent.replace(/\s+/g, ' ').trim(),
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt') || ''
        };
    });

    // estrutura da janela em foco (criada uma vez só)
    var foco = document.createElement('div');
    foco.className = 'foco';
    foco.hidden = true;
    foco.innerHTML =
        '<div class="focoCartao" role="dialog" aria-modal="true" aria-label="Época em foco">' +
        '<button class="focoFechar" type="button" aria-label="Fechar">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<div class="focoImagem"><img alt=""></div>' +
        '<div class="focoTexto">' +
        '<div class="conteudoFoco"><span class="focoLocal"></span><span class="focoAno"></span><h3></h3><p></p></div>' +
        '<div class="focoNav">' +
        '<button class="focoSeta" data-dir="-1" type="button" aria-label="Época anterior"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button>' +
        '<div class="focoAnos"></div>' +
        '<button class="focoSeta" data-dir="1" type="button" aria-label="Próxima época"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' +
        '</div></div></div>';
    document.body.appendChild(foco);

    var cartao = foco.querySelector('.focoCartao');
    var imagem = foco.querySelector('.focoImagem img');
    var elLocal = foco.querySelector('.focoLocal');
    var elAno = foco.querySelector('.focoAno');
    var elTitulo = foco.querySelector('.focoTexto h3');
    var elTexto = foco.querySelector('.focoTexto p');
    var setas = foco.querySelectorAll('.focoSeta');
    var boxAnos = foco.querySelector('.focoAnos');

    var pills = epocas.map(function (e, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = e.ano;
        b.addEventListener('click', function () { ir(i); });
        boxAnos.appendChild(b);
        return b;
    });

    var atual = 0, gatilho = null, aberto = false, ocupado = false;
    var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function preencher(i) {
        var e = epocas[i];
        imagem.src = e.src;
        imagem.alt = e.alt;
        elLocal.textContent = local;
        elAno.textContent = e.ano;
        elTitulo.textContent = e.titulo;
        elTexto.textContent = e.texto;
        pills.forEach(function (b, n) { b.classList.toggle('ativo', n === i); });
        setas[0].disabled = i === 0;
        setas[1].disabled = i === epocas.length - 1;
        atual = i;
    }

    function ir(i) {
        if (i < 0 || i >= epocas.length || i === atual || ocupado) return;
        if (semMovimento) { preencher(i); return; }
        ocupado = true;
        cartao.classList.add('trocando');
        setTimeout(function () {
            preencher(i);
            cartao.classList.remove('trocando');
            ocupado = false;
        }, 230);
    }

    function abrir(i, origem) {
        gatilho = origem;
        preencher(i);
        foco.hidden = false;
        void foco.offsetWidth; // reinicia a animação de entrada
        foco.classList.add('aberto');
        document.documentElement.style.overflow = 'hidden';
        aberto = true;
        foco.querySelector('.focoFechar').focus();
    }

    function fechar() {
        if (!aberto) return;
        aberto = false;
        foco.classList.remove('aberto');
        document.documentElement.style.overflow = '';
        setTimeout(function () { foco.hidden = true; }, semMovimento ? 0 : 300);
        if (gatilho) gatilho.focus();
    }

    itens.forEach(function (el, i) {
        el.tabIndex = 0;
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', 'Ver ' + epocas[i].ano + ' em foco');
        el.addEventListener('click', function () { abrir(i, el); });
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(i, el); }
        });
    });

    setas.forEach(function (b) {
        b.addEventListener('click', function () { ir(atual + Number(b.getAttribute('data-dir'))); });
    });
    foco.querySelector('.focoFechar').addEventListener('click', fechar);
    foco.addEventListener('click', function (e) { if (e.target === foco) fechar(); });
    document.addEventListener('keydown', function (e) {
        if (!aberto) return;
        if (e.key === 'Escape') fechar();
        else if (e.key === 'ArrowRight') ir(atual + 1);
        else if (e.key === 'ArrowLeft') ir(atual - 1);
    });
})();

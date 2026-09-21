/* Transição entre páginas (urbanização -> cidades inteligentes).
   Uso: coloque data-transicao em qualquer link que deva animar. */
(function () {
    var raiz = document.documentElement;

    // Página nova: se chegou por um link animado, abre a cortina.
    if (location.search.indexOf('transicao') !== -1) {
        raiz.classList.add('entrando');
        setTimeout(function () { raiz.classList.remove('entrando'); }, 1300);
        try {
            history.replaceState(null, '', location.pathname + location.hash);
        } catch (e) { }
    }

    // Página atual: fecha a cortina e só então troca de página.
    document.addEventListener('click', function (e) {
        var link = e.target.closest && e.target.closest('a[data-transicao]');
        if (!link) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        e.preventDefault();
        var destino = link.getAttribute('href');
        destino += (destino.indexOf('?') === -1 ? '?' : '&') + 'transicao';
        raiz.classList.add('saindo');
        setTimeout(function () { location.href = destino; }, 650);
    });

    // Voltar pelo navegador não deve deixar a cortina fechada.
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) raiz.classList.remove('saindo', 'entrando');
    });
})();

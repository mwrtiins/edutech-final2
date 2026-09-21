/* Estudo de caso: "Ver mais" abre o cartão (foto desliza, texto aparece); "Ver menos" fecha. */
document.querySelectorAll('.cardCaso').forEach(function (card) {
    var mais = card.querySelector('.verMais'), menos = card.querySelector('.verMenos');
    if (!mais || !menos) return;
    function abrir(a) {
        card.classList.toggle('aberto', a);
        mais.setAttribute('aria-expanded', a);
        if (a) menos.focus({ preventScroll: true });
        else setTimeout(function () { mais.focus({ preventScroll: true }); }, 450);
    }
    mais.addEventListener('click', function () { abrir(true); });
    menos.addEventListener('click', function () { abrir(false); });
});

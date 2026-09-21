/* "Descubra o filme": clique no pôster para virar o cartão.
   Conta quantos filmes já foram descobertos. */
(function () {
    var secao = document.querySelector('.cinema');
    var filmes = document.querySelectorAll('.filme');
    if (!secao || !filmes.length) return;

    var contador = document.getElementById('filmesDescobertos');
    var barra = document.getElementById('barraFilmes');
    var texto = document.querySelector('.contadorFilmes');
    var descobertos = 0;

    function atualizar() {
        contador.textContent = descobertos;
        barra.style.width = (descobertos / filmes.length * 100) + '%';
        if (descobertos === filmes.length) {
            secao.classList.add('completo');
            texto.textContent = 'Você descobriu todos os filmes!';
        }
    }

    filmes.forEach(function (filme, i) {
        filme.style.setProperty('--n', i);
        var rotulo = filme.querySelector('.textoRotulo');

        function virar() {
            var virado = filme.classList.toggle('virado');
            if (virado && !filme.classList.contains('descoberto')) {
                filme.classList.add('descoberto');
                rotulo.textContent = 'Ver ficha do filme';
                descobertos++;
                atualizar();
            }
        }

        filme.addEventListener('click', function (e) {
            if (e.target.closest('.verImdb')) return; // o link não vira o cartão
            virar();
        });
        filme.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); virar(); }
        });
    });

    // Entrada: os pôsteres sobem um de cada vez quando a seção aparece.
    filmes.forEach(function (f) { f.classList.add('preparado'); });
    if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (itens) {
            if (itens[0].isIntersecting) {
                filmes.forEach(function (f) { f.classList.add('visivel'); });
                obs.disconnect();
            }
        }, { threshold: 0.2 });
        obs.observe(document.querySelector('.cardsCinema'));
    } else {
        filmes.forEach(function (f) { f.classList.add('visivel'); });
    }
})();

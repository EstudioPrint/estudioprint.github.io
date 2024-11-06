let lastScrollTop = 0; // Guardamos la posición anterior del scroll

window.addEventListener("scroll", function() {
    let header = document.querySelector("header");
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop) {
        // Si estamos bajando, ocultamos el header
        header.style.top = "-100px"; // Desaparece el header (ajustable si es necesario)
    } else {
        // Si estamos subiendo, mostramos el header
        header.style.top = "0";
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Evitar que el scroll se vuelva negativo
});

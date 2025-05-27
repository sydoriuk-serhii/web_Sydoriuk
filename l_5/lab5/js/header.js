document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.querySelector('.burger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenu = document.querySelector('.close-menu');

    burgerMenu.addEventListener('click', function() {
        mobileMenu.classList.toggle('show-menu');
    });
    closeMenu.addEventListener('click', function() {
        mobileMenu.classList.remove('show-menu');
    });
});



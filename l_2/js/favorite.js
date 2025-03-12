document.addEventListener('DOMContentLoaded', function () {
    const scrollLeftButton = document.querySelector('.favorites-container .scroll-button.left');
    const scrollRightButton = document.querySelector('.favorites-container .scroll-button.right');
    const favoritesList = document.querySelector('.favorites-list');

    scrollLeftButton.addEventListener('click', () => {
        favoritesList.scrollBy({ left: -200, behavior: 'smooth' });
    });

    scrollRightButton.addEventListener('click', () => {
        favoritesList.scrollBy({ left: 200, behavior: 'smooth' });
    });
});
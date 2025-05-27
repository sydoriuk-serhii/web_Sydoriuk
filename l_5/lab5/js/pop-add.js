// Відкриття модального вікна
document.addEventListener('DOMContentLoaded', function () {
    const buttonsAdd = document.querySelectorAll('.button-add');
    const popAdd = document.querySelector('.pop-add');
    const closeButton = popAdd.querySelector('.close');

    buttonsAdd.forEach(button => {
        button.addEventListener('click', () => {
            popAdd.style.display = 'flex';
        });
    });

    closeButton.addEventListener('click', () => {
        popAdd.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === popAdd) {
            popAdd.style.display = 'none';
        }
    });
});
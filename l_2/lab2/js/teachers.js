document.addEventListener('DOMContentLoaded', function () {
    const teachers = document.querySelectorAll('.teacher');
    const modal = document.getElementById('teacherModal');
    const closeBtn = document.querySelector('.close');
    const modalImage = document.getElementById('modalImage');
    const modalName = document.getElementById('modalName');
    const modalSubject = document.getElementById('modalSubject');
    const modalCountry = document.getElementById('modalCountry');
    const modalAge = document.getElementById('modalAge');
    const modalEmail = document.getElementById('modalEmail');

    if (!modal || !closeBtn || !modalImage || !modalName || !modalSubject || !modalCountry || !modalAge || !modalEmail) {
        console.error("One or more modal elements are missing in the DOM.");
        return;
    }

    teachers.forEach(teacher => {
        teacher.addEventListener('click', () => {
            const image = teacher.getAttribute('data-image');
            const name = teacher.getAttribute('data-name');
            const subject = teacher.getAttribute('data-subject');
            const country = teacher.getAttribute('data-country');
            const age = teacher.getAttribute('data-age');

            if (!image || !name || !subject || !country || !age) {
                console.error("Missing data attributes in the teacher element.");
                return;
            }

            const email = generateEmail(name);

            modalImage.src = image;
            modalName.textContent = name;
            modalSubject.textContent = subject;
            modalCountry.textContent = country;
            modalAge.textContent = age;
            modalEmail.textContent = email;

            modal.style.display = 'flex';

            console.log("Image path:", image);
            console.log("Teacher data loaded:", { name, subject, country, age, email });
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    function generateEmail(name) {
        if (!name) {
            console.error("Name is undefined or empty.");
            return "unknown@domain.com";
        }

        const formattedName = name.toLowerCase().replace(/\s+/g, '_');
        return `${formattedName}@domain.com`; // Додаємо домен
    }
});

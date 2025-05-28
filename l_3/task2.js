
function validateProcessedUser(user) {
    const errors = [];


    const phoneFormats = {
        'Germany': /^(\+49|0)[1-9][0-9]{1,14}$/,
        'United States': /^(\+1|1)?[2-9][0-8][0-9][2-9][0-9]{6}$/,
        'Ukraine': /^(\+380|0)[1-9][0-9]{8}$/,
        'default': /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/
    };

    // 1. Перевірка рядкових полів (мають починатись з великої літери)
    const stringFields = ['full_name', 'gender', 'note', 'state', 'city', 'country'];
    stringFields.forEach(field => {
        if (!user[field]) {
            errors.push(`Поле ${field} відсутнє`);
        } else if (typeof user[field] !== 'string') {
            errors.push(`Поле ${field} має бути рядком`);
        } else if (!/^[A-ZА-ЯЄІЇҐ]/.test(user[field])) {
            errors.push(`Поле ${field} має починатись з великої літери: "${user[field]}"`);
        }
    });

    // 2. Перевірка віку
    if (typeof user.age !== 'number' || isNaN(user.age)) {
        errors.push(`Вік має бути числом: ${user.age}`);
    }

    // 3. Перевірка телефону (формат залежить від країни)
    if (user.phone && user.country) {
        const format = phoneFormats[user.country] || phoneFormats.default;
        if (!format.test(user.phone)) {
            errors.push(`Телефон не відповідає формату для ${user.country}: ${user.phone}`);
        }
    } else if (!user.phone) {
        errors.push('Телефон відсутній');
    }

    // 4. Перевірка email
    if (!user.email || typeof user.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        errors.push(`Email має невірний формат: ${user.email}`);
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : null
    };
}

// Приклад використання з об'єктом з першого завдання
const processedUser = {
    gender: "male",
    title: "Mr",
    full_name: "Norbert Weishaupt",
    city: "Rhön-Grabfeld",
    state: "Mecklenburg-Vorpommern",
    country: "Germany",
    postcode: 52640,
    coordinates: { latitude: "-42.1817", longitude: "-152.1685" },
    timezone: { offset: "+9:30", description: "Adelaide, Darwin" },
    email: "norbert.weishauptexample.com",
    b_date: "1956-12-23T19:09:19.602Z",
    age: "ff",
    phone: "08798291509",
    picture_Large: "https://randomuser.me/api/portraits/men/28.jpg",
    picture_thumbnail: "https://randomuser.me/api/portraits/thumb/men/28.jpg",
    id: "fgesrg456dsf234c1",
    favorite: true,
    course: "Mathematics",
    bg_color: "#1f75cb",
    note: "Important customer"
};

const validUser = {
    gender: "Male",
    title: "Mr",
    full_name: "Іван Петренко",  // Починається з великої літери (українська)
    city: "Київ",
    state: "Київська область",
    country: "Ukraine",
    postcode: 01001,
    coordinates: { latitude: "50.4501", longitude: "30.5234" },
    timezone: { offset: "+2:00", description: "Kyiv" },
    email: "ivan.petrenko@example.com",  // Валідний email
    b_date: "1990-05-15T00:00:00.000Z",
    age: 33,  // Число
    phone: "+380501234567",  // Валідний український номер
    picture_Large: "https://example.com/photo.jpg",
    picture_thumbnail: "https://example.com/photo_thumb.jpg",
    id: "user123",
    favorite: true,
    course: "Computer Science",
    bg_color: "#1e88e5",
    note: "Постійний клієнт"  // Починається з великої літери
};

const validationfailResult = validateProcessedUser(processedUser);
console.log(validationfailResult);

const validationsuccessResult = validateProcessedUser(validUser);
console.log(validationsuccessResult);

// Для використання в інших файлах
module.exports = { validateProcessedUser };

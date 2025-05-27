import { additionalUsers, randomUserMock } from "./random-user-mock.js";

//Task1
const courseList = [
    "Mathematics", "Physics", "English", "Computer Science", "Dancing",
    "Chess", "Biology", "Chemistry", "Law", "Art", "Medicine", "Statistics"
];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function formatRandomUser(user, id) {
    return {
        id,
        gender: user.gender,
        title: user.name?.title || "",
        full_name: user.full_name || `${user.name?.first} ${user.name?.last}`,
        city: user.location?.city || user.city || "",
        state: user.location?.state || "",
        country: user.location?.country || user.country || "",
        postcode: user.location?.postcode,
        coordinates: user.location?.coordinates || {},
        timezone: user.location?.timezone || {},
        email: user.email,
        b_date: user.dob?.date || user.b_date,
        age: user.dob?.age || user.age,
        phone: user.phone,
        picture_large: user.picture?.large || "",
        picture_thumbnail: user.picture?.thumbnail || "",
        favorite: user.favorite || false,
        course: user.course || getRandomElement(courseList),
        bg_color: "#ffffff",
        note: user.note || ""
    };
}

function completeAdditionalUser(user, id) {
    return {
        id: id,
        gender: user.gender,
        title: user.title || "",
        full_name: user.full_name,
        city: user.city,
        state: user.state,
        country: user.country,
        postcode: user.postcode,
        coordinates: user.coordinates,
        timezone: user.timezone,
        email: user.email,
        b_date: user.b_day || null,
        age: user.age || calculateAge(user.b_day),
        phone: user.phone,
        picture_large: user.picture_large || "",
        picture_thumbnail: user.picture_thumbnail || "",
        favorite: user.favorite || false,
        course: user.course || getRandomElement(courseList),
        bg_color: user.bg_color || "#ffffff",
        note: user.note || ""
    };
}

function calculateAge(dateString) {
    if (!dateString) return null;
    const diff = Date.now() - new Date(dateString).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function transformUsers(randomUserMock, additionalUsers) {
    const result = [];
    const seenKeys = new Set();
    let id = 1;

    for (const user of randomUserMock) {
        const formatted = formatRandomUser(user, id);
        const key = formatted.full_name;

        if (!seenKeys.has(key)) {
            result.push(formatted);
            seenKeys.add(key);
            id++;
        }
    }

    for (const user of additionalUsers) {
        const completed = completeAdditionalUser(user, id);
        const key = completed.full_name;

        if (!seenKeys.has(key)) {
            result.push(completed);
            seenKeys.add(key);
            id++;
        }
    }

    return result;
}

export const users = transformUsers(randomUserMock, additionalUsers);

// console.log(users);

//Task2

const phonePatterns = {
    'Norway': /^\d{8}$/,
    'Denmark': /^\d{8}$/,
    'Germany': /^0\d{3}-\d{7}$/,
    'Ireland': /^0\d{2}-\d{3}-\d{4}$/,
    'Australia': /^0\d{1,2}-\d{4}-\d{4}$/,
    'United States': /^\(\d{3}\)-\d{3}-\d{4}$/,
    'Finland': /^0\d{1}-\d{3}-\d{3}$/,
    'Turkey': /^\(\d{3}\)-\d{3}-\d{4}$/,
    'Iran': /^\d{3}-\d{8}$/,
    'Switzerland': /^\d{3} \d{3} \d{2} \d{2}$/,
    'Netherlands': /^\(\d{3}\)-\d{3}-\d{4}$/,
    'Canada': /^\d{3}-\d{3}-\d{4}$/,
    'France': /^0\d{1}-\d{2}-\d{2}-\d{2}-\d{2}$/,
    'Spain': /^\d{3}-\d{3}-\d{3}$/,
    'New Zealand': /^\(\d{3}\)-\d{3}-\d{4}$/
};

export function validateUser(user) {
    // Перевірка для email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(user.email)) {
        console.log(`Invalid email: ${user.email}`);
        return false;
    }

    // Перевірка для phone
    const phonePattern = phonePatterns[user.country] || /^\d{10}$/;
    if (!phonePattern.test(user.phone)) {
        console.log(`Invalid phone for ${user.country}: ${user.phone}`);
        return false;
    }

    // Перевірка для b_date
    const birthDate = new Date(user.b_date);
    const today = new Date();

    if (birthDate > today) {
        console.log(`Birth date is in the future: ${user.b_date}`);
        return false;
    }

    return true;
}

// users.forEach(user => {
//     if (validateUser(user)) {
//         console.log(`User ${user.full_name} is valid!\n`);
//     } else {
//         console.log(`User ${user.full_name} is invalid\n`);
//     }
// });

// Task 3

let filters = {
    country: "Norway",
    age: 28,
    gender: "female",
    favorite: false
};

function filterUsers(users, filters) {
    return users.filter(user => {
        for (let key in filters) {
            if (filters[key] && user[key] !== filters[key]) {
                return false;
            }
        }
        return true;
    });
}

// let filteredUsers = filterUsers(users, filters);

// console.log(filteredUsers);

// Task 4

function sortUsers(users, sortBy, order = 'asc') {
    return users.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        // Cортуємо по даті народження
        if (sortBy === 'b_day') {
            valA = new Date(valA);
            valB = new Date(valB);
        }

        const isNullA = valA === null || valA === undefined;
        const isNullB = valB === null || valB === undefined;

        if (isNullA && !isNullB) return 1;
        if (!isNullA && isNullB) return -1;
        if (isNullA && isNullB) return 0;

        // Сортуємо по віку
        if (typeof valA === 'number' && typeof valB === 'number') {
            return order === 'asc' ? valA - valB : valB - valA;
        }

        // Сортуємо за алфавітним порядком
        if (typeof valA === 'string' && typeof valB === 'string') {
            return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return 0;
    });
}

// let sortedByAgeAsc = sortUsers(users, 'age', 'asc');
// console.log(sortedByAgeAsc);

// let sortedByNameDesc = sortUsers(users, 'full_name', 'desc');
// console.log(sortedByNameDesc);

// let sortedByBirthdayAsc = sortUsers(users, 'b_day', 'asc');
// console.log(sortedByBirthdayAsc);

// let sortedByCountryDesc = sortUsers(users, 'country', 'desc');
// console.log(sortedByCountryDesc);

// Task 5

function findUserByParam(users, key, value) {
    return users.find(user => {
        const userValue = user[key];

        if (typeof value === 'string' && typeof userValue === 'string') {
            return userValue.toLowerCase().includes(value.toLowerCase());
        }

        if (typeof value === 'number') {
            return userValue === value;
        }

        return false;
    });
}

// console.log(findUserByParam(users, 'full_name', 'Sigrid'));
// console.log(findUserByParam(users, 'note', ''));
// console.log(findUserByParam(users, 'age', 28));

// Task 6

function getMatchPercentage(users, predicateFn) {
    if (!Array.isArray(users) || users.length === 0) return 0;

    const matchedCount = users.filter(predicateFn).length;
    return Math.round((matchedCount / users.length) * 100);
}

const percentOver30 = getMatchPercentage(users, user => user.age > 30);
// console.log('Percent of people over 30: ' + percentOver30);
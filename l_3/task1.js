const { randomUserMock, additionalUsers } = require('./data.js');
// Список курсів
const COURSES = [
    "Mathematics", "Physics", "English", "Computer Science",
    "Dancing", "Chess", "Biology", "Chemistry",
    "Law", "Art", "Medicine", "Statistics"
];

function formatUserData(userData) {
    return {
        gender: userData.gender,
        title: userData.name.title,
        full_name: `${userData.name.first} ${userData.name.last}`,
        city: userData.location.city,
        state: userData.location.state,
        country: userData.location.country,
        postcode: userData.location.postcode,
        coordinates: {
            Latitude: userData.location.coordinates.latitude,
            Longitude: userData.location.coordinates.longitude
        },
        timezone: {
            offset: userData.location.timezone.offset,
            description: userData.location.timezone.description
        },
        email: userData.email,
        b_date: userData.dob.date,
        age: userData.dob.age,
        phone: userData.phone,
        picture_Large: userData.picture.large,
        picture_thumbnail: userData.picture.thumbnail
    };
}


function generateId() {
    return Math.random().toString(36).substr(2, 9);
}


function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


function addAdditionalFields(user) {
    return {
        ...user,
        id: user.id || generateId(),
        favorite: typeof user.favorite === 'boolean' ? user.favorite : false,
        course: user.course || COURSES[Math.floor(Math.random() * COURSES.length)],
        bg_color: user.bg_color || getRandomColor(),
        note: user.note || ""
    };
}

function mergeArrays(primaryArray, secondaryArray) {
    const merged = [...primaryArray];
    const emails = new Set(primaryArray.map(user => user.email));

    for (const user of secondaryArray) {
        if (!emails.has(user.email)) {
            // Якщо в додаткових даних немає деяких полів, додаємо їх
            const formattedUser = {
                ...user,
                picture_Large: user.picture_large || user.picture_Large || null,
                picture_thumbnail: user.picture_thumbnail || user.picture_thumbnail || null,
                b_date: user.b_day || user.b_date || null,
                age: user.age || (user.b_day ? new Date().getFullYear() - new Date(user.b_day).getFullYear() : null)
            };

            merged.push(addAdditionalFields(formattedUser));
            emails.add(user.email);
        }
    }

    return merged;
}


function processUserData(randomUserMockData, additionalUsersData) {
    const formattedPrimary = randomUserMockData.map(user =>
        addAdditionalFields(formatUserData(user))
    );

    return mergeArrays(formattedPrimary, additionalUsersData);
}


const result = processUserData(randomUserMock, additionalUsers);
console.log(result)

module.exports = {
    result,
    randomUserMock,
    additionalUsers
};

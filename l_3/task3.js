const { result } = require('./task1.js');

function filterUsers(filters = {}, usersArray = result) {
    return usersArray.filter(user => {
        const meetsAllConditions = Object.entries(filters).every(([key, value]) => {
            if (!user.hasOwnProperty(key)) return false;

            if (key === 'age') {
                return user.age >= value; // Фільтруємо користувачів старших або рівних заданому віку
            }

            if (typeof value === 'string') {
                return user[key].toString().toLowerCase() === value.toLowerCase();
            }

            return user[key] === value;
        });

        return meetsAllConditions;
    });
}


//Фільтр за країною (Німеччина) та віком (40+ років)
const germanAdults = filterUsers({
    country: 'Germany',
    age: 40
}, result);

console.log('Користувачі з Німеччини 40+ років:', germanAdults.length);
germanAdults.forEach(user => {
    console.log(`${user.full_name}, ${user.age} років, ${user.country}`);
});

//Фільтр за країною (США) та віком (30-50 років)
const usMiddleAged = filterUsers({
    country: 'United States',
    age: 30
}, result).filter(user => user.age <= 50); // Додатковий фільтр через функцію

console.log('\nКористувачі з США 30-50 років:', usMiddleAged.length);
usMiddleAged.forEach(user => {
    console.log(`${user.full_name}, ${user.age} років`);
});

//Фільтр за країною (Туреччина) та віком (35+)
const turkishMature = filterUsers({
    country: 'Turkey',
    age: 35
}, result);

console.log('\nКористувачі з Туреччини 35+ років:', turkishMature.length);
turkishMature.forEach(user => {
    console.log(`${user.full_name}, ${user.gender}, ${user.age} років`);
});

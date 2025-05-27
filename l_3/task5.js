const { result } = require('./task1.js');


function findUser(searchParams = {}, data = result) {

    if (Object.keys(searchParams).length === 0) {
        console.warn('Не вказано параметрів для пошуку');
        return null;
    }


    const searchableFields = ['full_name', 'note', 'age'];

    const invalidParams = Object.keys(searchParams).filter(
        param => !searchableFields.includes(param)
    );

    if (invalidParams.length > 0) {
        console.warn(`Наступні параметри пошуку не підтримуються: ${invalidParams.join(', ')}. Доступні поля: ${searchableFields.join(', ')}`);
        return null;
    }

    return data.find(item => {
        return Object.entries(searchParams).every(([key, value]) => {
            if (!item.hasOwnProperty(key)) return false;

            if (typeof value === 'string') {
                return item[key].toString().toLowerCase().includes(value.toLowerCase());
            }

            return item[key] === value;
        });
    }) || null;
}



//Пошук за іменем (частина імені)
const userByName = findUser({ full_name: 'Elias Tikkanen' });
console.log('Користувач з іменем, що містить "Elias Tikkanen":');
console.log(userByName);

//Пошук за точним віком
const userByAge = findUser({ age: 30 });
console.log('\nКористувач з точним віком 30:');
console.log(userByAge);

//Пошук за нотаткою (частина тексту)
const userByNote = findUser({ note: 'important' });
console.log('\nКористувач з нотаткою, що містить "important":');
console.log(userByNote);

//Пошук за кількома параметрами
const userByNameAndAge = findUser({ full_name: 'Oscar Dupont', age: 70 });
console.log('\nКористувач з іменем "Oscar Dupont" та віком 70:');
console.log(userByNameAndAge);

//Пошук за неіснуючим параметром
const userByInvalidParam = findUser({ occupation: 'developer' });
console.log('\nСпроба пошуку за неіснуючим параметром:');
console.log(userByInvalidParam);

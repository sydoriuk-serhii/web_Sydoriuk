const { result } = require('./task1.js');


function sortUsers(data = result, options = { field: 'age', order: 'asc' }) {
    const availableFields = ['full_name', 'age', 'b_day', 'country'];
    if (!availableFields.includes(options.field)) {
        console.warn(`Поле "${options.field}" не доступне для сортування. Доступні поля: ${availableFields.join(', ')}`);
        return data;
    }

    return [...data].sort((a, b) => {
        if (!a.hasOwnProperty(options.field)) return 1;
        if (!b.hasOwnProperty(options.field)) return -1;

        let valueA = a[options.field];
        let valueB = b[options.field];

        if (typeof valueA === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
            return options.order === 'asc'
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
        }

        return options.order === 'asc'
            ? valueA - valueB
            : valueB - valueA;
    });
}

console.log("--------------------------------");
// 1. Сортування за віком (зростання)
const sortedByAgeAsc = sortUsers(result, { field: 'age', order: 'asc' });
console.log('Сортування за віком (зростання):');
console.log(sortedByAgeAsc.slice(0, 5)); // Виводимо перші 5 записів
console.log("--------------------------------");
// 2. Сортування за віком (спадання)
const sortedByAgeDesc = sortUsers(result, { field: 'age', order: 'desc' });
console.log('\nСортування за віком (спадання):');
console.log(sortedByAgeDesc.slice(0, 5));
console.log("--------------------------------");
// 3. Сортування за країною (зростання)
const sortedByCountryAsc = sortUsers(result, { field: 'country', order: 'asc' });
console.log('\nСортування за країною (зростання):');
console.log(sortedByCountryAsc.slice(0, 5));
console.log("--------------------------------");
// 4. Сортування за іменем (спадання)
const sortedByNameDesc = sortUsers(result, { field: 'full_name', order: 'desc' });
console.log('\nСортування за іменем (спадання):');
console.log(sortedByNameDesc.slice(0, 5));
console.log("--------------------------------");
// 5. Сортування за датою народження (зростання)
const sortedByBirthdayAsc = sortUsers(result, { field: 'b_day', order: 'asc' });
console.log('\nСортування за датою народження (зростання):');
console.log(sortedByBirthdayAsc.slice(0, 5));

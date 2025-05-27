const { result } = require('./task1.js');


function calculatePercentage(searchCriteria = {}, data = result) {
    if (data.length === 0 || Object.keys(searchCriteria).length === 0) {
        return 0;
    }

    const filteredData = data.filter(item => {
        return Object.entries(searchCriteria).every(([key, value]) => {
            if (!item.hasOwnProperty(key)) return false;

            if (key === 'age' && typeof value === 'object') {
                if (value.gt !== undefined) return item.age > value.gt;
                if (value.lt !== undefined) return item.age < value.lt;
                if (value.gte !== undefined) return item.age >= value.gte;
                if (value.lte !== undefined) return item.age <= value.lte;
                return false;
            }

            if (typeof value === 'string') {
                return item[key].toString().toLowerCase().includes(value.toLowerCase());
            }

            return item[key] === value;
        });
    });

    const percentage = (filteredData.length / data.length) * 100;
    return parseFloat(percentage.toFixed(2)); // Округлюємо до 2 знаків після коми
}

// Приклади використання:

//Відсоток користувачів старших 30 років
const ageOver30Percent = calculatePercentage({ age: { gt: 30 } });
console.log(`Відсоток користувачів старших 30 років: ${ageOver30Percent}%`);

//Відсоток користувачів з повним іменем, що містить "Maxine James"
const nameJohnPercent = calculatePercentage({ full_name: 'Maxine James' });
console.log(`Відсоток користувачів з іменем Maxine James: ${nameJohnPercent}%`);

//Відсоток користувачів молодших або рівних 25 років
const ageUnder25Percent = calculatePercentage({ age: { lte: 25 } });
console.log(`Відсоток користувачів 25 років та молодше: ${ageUnder25Percent}%`);

//Відсоток користувачів з нотаткою, що містить "important"
const noteImportantPercent = calculatePercentage({ note: 'important' });
console.log(`Відсоток користувачів з важливою нотаткою: ${noteImportantPercent}%`);

//Відсоток користувачів з іменем "Beatrice Bergeron" та віком 60+
const annaOver30Percent = calculatePercentage({
    full_name: 'Beatrice Bergeron',
    age: { gte: 60 }
});
console.log(`Відсоток Beatrice Bergeron 30+ років: ${annaOver30Percent}%`);

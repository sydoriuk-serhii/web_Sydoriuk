"use strict";
const generateRandomBirthday = () => {
    const month = Math.floor(Math.random() * 12) + 1; // 1-12
    const day = Math.floor(Math.random() * 28) + 1; // 1-28 (щоб уникнути проблем з 29-31)
    return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};
const courses = [
    "Mathematics", "Physics", "English", "Computer Science", "Dancing",
    "Chess", "Biology", "Chemistry", "Law", "Art", "Medicine", "Statistics"
];
const ITEMS_PER_PAGE = 10;
const getRandomCourse = () => courses[Math.floor(Math.random() * courses.length)];
// Function to calculate days until next birthday
const calculateDaysUntilBirthday = (birthday) => {
    // Перевірка на пусте або невалідне значення
    if (!birthday || birthday === "-" || !birthday.includes('-')) {
        return "-";
    }
    try {
        const today = dayjs();
        const currentYear = today.year();
        // Розбиваємо дату на місяць і день
        const [monthStr, dayStr] = birthday.split('-');
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);
        // Перевірка на коректність місяця і дня
        if (month < 1 || month > 12 || day < 1 || day > 31) {
            return "-";
        }
        // Створюємо дату народження для поточного року
        let nextBirthday = dayjs(`${currentYear}-${monthStr.padStart(2, '0')}-${dayStr.padStart(2, '0')}`);
        // Якщо день народження вже минув цього року, беремо наступний рік
        if (nextBirthday.isBefore(today, 'day')) {
            nextBirthday = nextBirthday.add(1, 'year');
        }
        // Розраховуємо різницю в днях
        const daysLeft = nextBirthday.diff(today, 'day');
        // Повертаємо результат з правильним форматом
        return `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
    }
    catch (e) {
        console.error("Помилка розрахунку днів до народження:", e);
        return "-";
    }
};
const normalizeUser = (user) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    // Обробка дати народження
    let birthDate = "-";
    let age = 0;
    if (user.dob) {
        // Якщо dob - об'єкт (як у randomuser.me API)
        if (typeof user.dob === 'object') {
            birthDate = user.dob.date ? new Date(user.dob.date).toISOString().split('T')[0] : "-";
            age = user.dob.age || 0;
        }
        // Якщо dob - рядок (для локальних даних)
        else if (typeof user.dob === 'string') {
            birthDate = user.dob;
            // Розраховуємо вік, якщо він не вказаний
            age = user.age || calculateAge(user.dob);
        }
    }
    // Обробка координат
    let coordinates = { latitude: "-", longitude: "-" };
    if ((_a = user.location) === null || _a === void 0 ? void 0 : _a.coordinates) {
        coordinates = {
            latitude: user.location.coordinates.latitude || "-",
            longitude: user.location.coordinates.longitude || "-"
        };
    }
    // Обробка фотографій
    const picture_large = ((_b = user.picture) === null || _b === void 0 ? void 0 : _b.large) || "img/placeholder.png";
    const picture_thumbnail = ((_c = user.picture) === null || _c === void 0 ? void 0 : _c.thumbnail) || "img/placeholder-thumb.png";
    // Генерація ID
    const id = ((_d = user.login) === null || _d === void 0 ? void 0 : _d.uuid) || user.id || Math.random().toString(36).substring(2, 9);
    const randomBirthday = generateRandomBirthday();
    return {
        gender: user.gender || "-",
        title: ((_e = user.name) === null || _e === void 0 ? void 0 : _e.title) || "-",
        full_name: `${((_f = user.name) === null || _f === void 0 ? void 0 : _f.first) || "-"} ${((_g = user.name) === null || _g === void 0 ? void 0 : _g.last) || "-"}`,
        city: ((_h = user.location) === null || _h === void 0 ? void 0 : _h.city) || "-",
        state: ((_j = user.location) === null || _j === void 0 ? void 0 : _j.state) || "-",
        country: ((_k = user.location) === null || _k === void 0 ? void 0 : _k.country) || "-",
        postcode: ((_m = (_l = user.location) === null || _l === void 0 ? void 0 : _l.postcode) === null || _m === void 0 ? void 0 : _m.toString()) || "-",
        coordinates: coordinates,
        timezone: ((_o = user.location) === null || _o === void 0 ? void 0 : _o.timezone) || { offset: "-", description: "-" },
        email: user.email || "-",
        b_date: randomBirthday,
        age: ((_p = user.dob) === null || _p === void 0 ? void 0 : _p.age) || Math.floor(Math.random() * 30) + 20,
        phone: user.phone || "-",
        picture_large: picture_large,
        picture_thumbnail: picture_thumbnail,
        id: id,
        favorite: user.favorite !== undefined ? user.favorite : false,
        course: user.course || getRandomCourse(),
        bg_color: user.bg_color || "#ffffff",
        note: user.note || null,
        days_until_birthday: calculateDaysUntilBirthday(randomBirthday),
    };
};
const fetchUsers = async () => {
    var _a;
    try {
        const localResponse = await fetch('http://localhost:3001/teachers');
        if (localResponse.ok) {
            const localData = await localResponse.json();
            if (localData && localData.length > 0) {
                return localData.map((user) => {
                    var _a;
                    return ({
                        ...normalizeUser(user),
                        favorite: user.favorite !== undefined ? user.favorite : false,
                        course: user.course || getRandomCourse(),
                        bg_color: user.bg_color || "#fffff",
                        note: user.note || null,
                        coordinates: user.coordinates || { latitude: "-", longitude: "-" },
                        days_until_birthday: ((_a = user.dob) === null || _a === void 0 ? void 0 : _a.date) ? calculateDaysUntilBirthday(new Date(user.dob.date).toISOString().split('T')[0]) : "-"
                    });
                });
            }
        }
    }
    catch (error) {
        console.warn('Could not fetch from local server:', error);
    }
    try {
        const response = await fetch('https://randomuser.me/api/?results=50');
        if (!response.ok)
            throw new Error(`API request failed with status ${response.status}`);
        const data = await response.json();
        return ((_a = data.results) === null || _a === void 0 ? void 0 : _a.map((user) => normalizeUser(user))) || [];
    }
    catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};
let users = [];
let filteredUsers = [];
let currentPage = 1;
let currentSortColumn = null;
let currentSortDirection = 'asc';
const container = document.getElementById("users-container");
const filtersSection = document.querySelector(".filters");
const favoritesContainer = document.getElementById("favorites-list");
const paginationContainer = document.getElementById("topTeachersPagination");
const tablePaginationContainer = document.getElementById("statsPagination");
const addTeacherModal = document.querySelector(".pop-add");
const teacherModal = document.getElementById("teacherModal");
const resetButton = document.createElement("button");
resetButton.textContent = "Reset Filters";
resetButton.className = "filter-button";
resetButton.id = "resetFilters";
const filterButton = document.createElement("button");
filterButton.textContent = "Apply Filters";
filterButton.className = "filter-button";
filterButton.id = "applyFilters";
const addTeacherBtnHeader = document.getElementById("addTeacherBtnHeader");
const addTeacherBtnMobile = document.getElementById("addTeacherBtnMobile");
const addTeacherBtnFooter = document.getElementById("addTeacherBtnFooter");
if (filtersSection) {
    filtersSection.appendChild(filterButton);
    filtersSection.appendChild(resetButton);
}
let chartInstances = {
    courseChart: null,
    regionChart: null
};
const toggleFavorite = async (userId) => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1)
        return;
    users[userIndex].favorite = !users[userIndex].favorite;
    const filteredUserIndex = filteredUsers.findIndex(u => u.id === userId);
    if (filteredUserIndex !== -1) {
        filteredUsers[filteredUserIndex].favorite = users[userIndex].favorite;
    }
    try {
        const response = await fetch(`http://localhost:3001/teachers/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorite: users[userIndex].favorite }),
        });
        if (!response.ok) {
            users[userIndex].favorite = !users[userIndex].favorite;
            if (filteredUserIndex !== -1) {
                filteredUsers[filteredUserIndex].favorite = users[userIndex].favorite;
            }
        }
        updateAllViews();
    }
    catch (error) {
        console.error('Error updating favorite:', error);
        users[userIndex].favorite = !users[userIndex].favorite;
        if (filteredUserIndex !== -1) {
            filteredUsers[filteredUserIndex].favorite = users[userIndex].favorite;
        }
        updateAllViews();
    }
};
const updateAllViews = () => {
    const usersToProcess = filteredUsers.length > 0 || hasActiveFilters() ? filteredUsers : users;
    renderUsers(usersToProcess);
    renderStatisticsTable(usersToProcess);
    renderFavorites();
    renderPagination(usersToProcess, paginationContainer, 'cards');
    renderPagination(usersToProcess, tablePaginationContainer, 'table');
};
const renderFavorites = () => {
    if (!favoritesContainer)
        return;
    const favoriteUsers = users.filter(user => user.favorite);
    favoritesContainer.innerHTML = favoriteUsers.length === 0
        ? '<p class="no-favorites">No favorite teachers yet</p>'
        : favoriteUsers.map(user => `
            <div class="favorite-item" data-id="${user.id}">
                <img src="${user.picture_thumbnail}" alt="${user.full_name}" class="favorite-image">
                <div class="favorite-info">
                    <h4>${user.full_name}</h4>
                    <p>${user.course}</p>
                    ${user.days_until_birthday !== "-" ? `<p class="birthday-countdown">Birthday in ${user.days_until_birthday}</p>` : ''}
                </div>
                <button class="favorite-button active" data-id="${user.id}">★</button>
            </div>
        `).join('');
    document.querySelectorAll('.favorite-item .favorite-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const userId = button.getAttribute('data-id');
            if (userId)
                toggleFavorite(userId);
        });
    });
    document.querySelectorAll('.favorite-item').forEach(item => {
        item.addEventListener('click', () => {
            const userId = item.getAttribute('data-id');
            const user = users.find(u => u.id === userId);
            if (user)
                openModal(user);
        });
    });
};
const hasActiveFilters = () => {
    return document.getElementById("age").value !== "All" ||
        document.getElementById("region").value !== "All" ||
        document.getElementById("sex").value !== "All" ||
        document.getElementById("onlyWithPhoto").checked ||
        document.getElementById("onlyFavorites").checked;
};
const filterUsers = () => {
    const ageFilter = document.getElementById("age").value;
    const regionFilter = document.getElementById("region").value;
    const sexFilter = document.getElementById("sex").value;
    const onlyWithPhoto = document.getElementById("onlyWithPhoto").checked;
    const onlyFavorites = document.getElementById("onlyFavorites").checked;
    let tempFilteredUsers = [...users];
    if (onlyFavorites)
        tempFilteredUsers = tempFilteredUsers.filter(user => user.favorite);
    if (onlyWithPhoto)
        tempFilteredUsers = tempFilteredUsers.filter(user => user.picture_large && user.picture_large !== "-" && user.picture_large !== "img/placeholder.png");
    if (ageFilter !== "All") {
        switch (ageFilter) {
            case "18-31":
                tempFilteredUsers = tempFilteredUsers.filter(user => user.age >= 18 && user.age <= 31);
                break;
            case "32-45":
                tempFilteredUsers = tempFilteredUsers.filter(user => user.age >= 32 && user.age <= 45);
                break;
            case "46+":
                tempFilteredUsers = tempFilteredUsers.filter(user => user.age >= 46);
                break;
        }
    }
    if (regionFilter !== "All") {
        const regions = {
            "Europe": ["France", "Germany", "Spain", "Ukraine", "Italy", "United Kingdom", "Ireland", "Switzerland", "Norway", "Denmark", "Finland", "Netherlands", "Belgium", "Austria", "Poland", "Portugal", "Sweden", "Czech Republic", "Hungary", "Romania", "Greece", "Serbia", "Croatia", "Slovakia", "Bulgaria", "Lithuania", "Latvia", "Estonia", "Slovenia", "Luxembourg", "Cyprus", "Malta", "Iceland"],
            "Asia": ["China", "Japan", "India", "Thailand", "South Korea", "Turkey", "Iran", "Iraq", "Israel", "Saudi Arabia", "United Arab Emirates", "Singapore", "Malaysia", "Indonesia", "Philippines", "Vietnam", "Pakistan", "Bangladesh", "Kazakhstan", "Uzbekistan"],
            "North America": ["USA", "Canada", "Mexico", "United States"],
        };
        if (regionFilter === "Other") {
            const allListedRegions = Object.values(regions).flat();
            tempFilteredUsers = tempFilteredUsers.filter(user => !allListedRegions.includes(user.country) && user.country !== "-");
        }
        else if (regions[regionFilter]) {
            tempFilteredUsers = tempFilteredUsers.filter(user => regions[regionFilter].includes(user.country));
        }
    }
    if (sexFilter !== "All") {
        tempFilteredUsers = tempFilteredUsers.filter(user => user.gender.toLowerCase() === sexFilter.toLowerCase());
    }
    filteredUsers = tempFilteredUsers;
    currentPage = 1;
    if (currentSortColumn) {
        sortUsers(currentSortColumn, currentSortDirection, true);
    }
    else {
        updateAllViews();
    }
};
const resetFilters = () => {
    document.getElementById("age").value = "All";
    document.getElementById("region").value = "All";
    document.getElementById("sex").value = "All";
    document.getElementById("onlyWithPhoto").checked = false;
    document.getElementById("onlyFavorites").checked = false;
    document.getElementById("searchInput").value = "";
    filteredUsers = [];
    currentPage = 1;
    currentSortColumn = null;
    document.querySelectorAll('#teachers-table th').forEach(h => h.classList.remove('asc', 'desc'));
    updateAllViews();
};
const setupFilters = () => {
    filterButton.addEventListener("click", filterUsers);
    resetButton.addEventListener("click", resetFilters);
    ["age", "region", "sex", "onlyWithPhoto", "onlyFavorites"].forEach(id => {
        const element = document.getElementById(id);
        if (element)
            element.addEventListener("change", filterUsers);
    });
};
const getPaginatedData = (data, page) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
};
const renderPagination = (data, containerElement, type) => {
    if (!containerElement)
        return;
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    containerElement.innerHTML = '';
    if (totalPages <= 1)
        return;
    const createButton = (content, handler, isDisabled = false, isActive = false) => {
        const button = document.createElement('span');
        button.textContent = content.toString();
        button.className = `page-button ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`;
        if (!isDisabled)
            button.addEventListener('click', handler);
        return button;
    };
    containerElement.appendChild(createButton('«', () => { if (currentPage > 1) {
        currentPage--;
        updateAllViews();
    } }, currentPage === 1));
    for (let i = 1; i <= totalPages; i++) {
        containerElement.appendChild(createButton(i, () => { currentPage = i; updateAllViews(); }, false, i === currentPage));
    }
    containerElement.appendChild(createButton('»', () => { if (currentPage < totalPages) {
        currentPage++;
        updateAllViews();
    } }, currentPage === totalPages));
};
const renderUsers = (usersToRender) => {
    if (!container)
        return;
    const paginatedUsers = getPaginatedData(usersToRender, currentPage);
    container.innerHTML = paginatedUsers.map(user => `
        <div class="user-card" style="background-color: ${user.bg_color};">
            <img src="${user.picture_thumbnail}" alt="${user.full_name}" class="user-image" onerror="this.onerror=null;this.src='img/placeholder-thumb.png';">
            <div class="user-info">
                <h3>${user.full_name}</h3>
                <p>${user.course}</p>
                <p>${user.country}${user.age ? `, ${user.age} years` : ''}</p>
                ${user.days_until_birthday !== "-" ? `<p class="birthday-countdown">Birthday in ${user.days_until_birthday}</p>` : ''}
            </div>
            <button class="favorite-button ${user.favorite ? 'active' : ''}" data-id="${user.id}">${user.favorite ? '★' : '☆'}</button>
        </div>
    `).join('');
    document.querySelectorAll('.user-card').forEach((card, index) => {
        const user = paginatedUsers[index];
        if (user) {
            card.addEventListener('click', (e) => {
                if (!(e.target instanceof HTMLElement && e.target.classList.contains('favorite-button'))) {
                    openModal(user);
                }
            });
            const favoriteButton = card.querySelector('.favorite-button');
            favoriteButton === null || favoriteButton === void 0 ? void 0 : favoriteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(user.id);
            });
        }
    });
};
const renderStatisticsTable = (usersToRender) => {
    const chartContainer = document.querySelector('.chart-container');
    if (!chartContainer)
        return;
    if (filteredUsers.length > 0 || !hasActiveFilters()) {
        chartContainer.style.display = 'block';
    }
    else {
        chartContainer.style.display = 'none';
        return;
    }
    const courseCounts = {};
    usersToRender.forEach(user => {
        courseCounts[user.course] = (courseCounts[user.course] || 0) + 1;
    });
    const countryCounts = {};
    usersToRender.forEach(user => {
        if (user.country && user.country !== "-") {
            countryCounts[user.country] = (countryCounts[user.country] || 0) + 1;
        }
    });
    const sortedCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    const courseLabels = Object.keys(courseCounts);
    const courseData = Object.values(courseCounts);
    const countryLabels = sortedCountries.map(([country]) => country);
    const countryData = sortedCountries.map(([, count]) => count);
    renderPieChart('teachersChart', courseLabels, courseData, 'Teachers by Course');
    if (countryLabels.length > 0) {
        renderPieChart('regionChart', countryLabels, countryData, 'Top Countries');
    }
};
const renderPieChart = (canvasId, labels, data, title) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas)
        return;
    const backgroundColors = labels.map((_, index) => {
        const hue = (index * 360 / labels.length) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    });
    if (canvasId === 'teachersChart' && chartInstances.courseChart) {
        chartInstances.courseChart.destroy();
    }
    else if (canvasId === 'regionChart' && chartInstances.regionChart) {
        chartInstances.regionChart.destroy();
    }
    const newChart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 1
                }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { boxWidth: 12 }
                },
                title: {
                    display: true,
                    text: title,
                    font: { size: 16 }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    if (canvasId === 'teachersChart') {
        chartInstances.courseChart = newChart;
    }
    else if (canvasId === 'regionChart') {
        chartInstances.regionChart = newChart;
    }
};
const sortUsers = (column, direction, sortFiltered = false) => {
    const usersArrayToSort = sortFiltered && filteredUsers.length > 0 ? filteredUsers : users;
    usersArrayToSort.sort((a, b) => {
        let valA;
        let valB;
        switch (column) {
            case 'name':
                valA = a.full_name.toLowerCase();
                valB = b.full_name.toLowerCase();
                break;
            case 'course':
                valA = a.course.toLowerCase();
                valB = b.course.toLowerCase();
                break;
            case 'age':
                valA = a.age;
                valB = b.age;
                break;
            case 'gender':
                valA = a.gender.toLowerCase();
                valB = b.gender.toLowerCase();
                break;
            case 'country':
                valA = a.country.toLowerCase();
                valB = b.country.toLowerCase();
                break;
            default: return 0;
        }
        if (valA < valB)
            return direction === 'asc' ? -1 : 1;
        if (valA > valB)
            return direction === 'asc' ? 1 : -1;
        return 0;
    });
    if (sortFiltered && filteredUsers.length > 0) {
        filteredUsers = usersArrayToSort;
    }
    else if (!sortFiltered) {
        users = usersArrayToSort;
        if (hasActiveFilters()) {
            filterUsers();
            return;
        }
    }
    currentPage = 1;
    updateAllViews();
};
const setupTableSorting = () => {
    document.querySelectorAll('#teachers-table th').forEach(header => {
        header.addEventListener('click', () => {
            const column = header.id.replace('sort-', '');
            const isCurrentlyAsc = header.classList.contains('asc');
            const direction = isCurrentlyAsc ? 'desc' : 'asc';
            document.querySelectorAll('#teachers-table th').forEach(h => h.classList.remove('asc', 'desc'));
            header.classList.add(direction);
            currentSortColumn = column;
            currentSortDirection = direction;
            const shouldSortFiltered = filteredUsers.length > 0 || hasActiveFilters();
            sortUsers(column, direction, shouldSortFiltered);
        });
    });
};
const openModal = (user) => {
    var _a;
    if (!teacherModal)
        return;
    const modalImage = document.getElementById("modalImage");
    const modalName = document.getElementById("modalName");
    const modalSubject = document.getElementById("modalSubject");
    const modalCountry = document.getElementById("modalCountry");
    const modalAge = document.getElementById("modalAge");
    const modalGender = document.getElementById("modalGender");
    const modalEmailLink = document.getElementById("modalEmailLink");
    const modalEmail = document.getElementById("modalEmail");
    const modalNumber = document.getElementById("modalNumber");
    const modalFavoriteButton = document.getElementById("modalFavoriteButton");
    const modalBirthdayCountdown = document.getElementById("modalBirthdayCountdown");
    modalImage.src = user.picture_large || "img/placeholder.png";
    modalImage.onerror = () => { modalImage.src = "img/placeholder.png"; };
    modalName.textContent = `${user.title} ${user.full_name}`;
    modalSubject.textContent = user.course;
    modalCountry.textContent = user.city ? `${user.city}, ${user.country}` : user.country;
    modalAge.textContent = `${user.age || "-"}`;
    modalGender.textContent = user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "-";
    modalEmail.textContent = user.email;
    modalEmailLink.href = `mailto:${user.email}`;
    modalNumber.textContent = user.phone;
    modalBirthdayCountdown.textContent = user.days_until_birthday !== "-" ?
        `Birthday in ${user.days_until_birthday}` : "Birthday date not available";
    modalFavoriteButton.textContent = user.favorite ? "★" : "☆";
    modalFavoriteButton.className = `favorite-button ${user.favorite ? 'active' : ''}`;
    const newFavButton = modalFavoriteButton.cloneNode(true);
    (_a = modalFavoriteButton.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newFavButton, modalFavoriteButton);
    newFavButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(user.id).then(() => {
            const latestUser = users.find(u => u.id === user.id);
            if (latestUser) {
                newFavButton.textContent = latestUser.favorite ? "★" : "☆";
                newFavButton.className = `favorite-button ${latestUser.favorite ? 'active' : ''}`;
            }
        });
    });
    teacherModal.style.display = "flex";
    window.toggleMap(user);
};
const initModals = () => {
    var _a;
    (_a = document.querySelector("#teacherModal .close")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        teacherModal.style.display = "none";
        if (window.teacherMap) {
            window.teacherMap.remove();
            window.teacherMap = undefined;
        }
    });
    const addTeacherClose = document.querySelector(".pop-add-header .close");
    addTeacherClose === null || addTeacherClose === void 0 ? void 0 : addTeacherClose.addEventListener("click", () => {
        addTeacherModal.style.display = "none";
        resetAddTeacherForm();
    });
    const openAddTeacherModal = () => {
        addTeacherModal.style.display = "block";
        const coursesDatalist = document.getElementById("coursesDatalist");
        if (coursesDatalist) {
            coursesDatalist.innerHTML = courses.map(course => `<option value="${course}"></option>`).join('');
        }
    };
    addTeacherBtnHeader === null || addTeacherBtnHeader === void 0 ? void 0 : addTeacherBtnHeader.addEventListener("click", openAddTeacherModal);
    addTeacherBtnMobile === null || addTeacherBtnMobile === void 0 ? void 0 : addTeacherBtnMobile.addEventListener("click", openAddTeacherModal);
    addTeacherBtnFooter === null || addTeacherBtnFooter === void 0 ? void 0 : addTeacherBtnFooter.addEventListener("click", openAddTeacherModal);
    window.addEventListener("click", (event) => {
        if (event.target === teacherModal) {
            teacherModal.style.display = "none";
            if (window.teacherMap) {
                window.teacherMap.remove();
                window.teacherMap = undefined;
            }
        }
        if (event.target === addTeacherModal) {
            addTeacherModal.style.display = "none";
            resetAddTeacherForm();
        }
    });
};
const addNewTeacher = async () => {
    const nameInput = document.getElementById("name-add");
    const specialityInput = document.getElementById("speciality-add");
    const countryInput = document.getElementById("country-add");
    const cityInput = document.getElementById("city-add");
    const phoneInput = document.getElementById("phone-add");
    const emailInput = document.getElementById("email-add");
    const dobInput = document.getElementById("dob-add");
    const sexInput = document.querySelector('input[name="sex-add"]:checked');
    const bgColorInput = document.getElementById("bg-color-add");
    const notesInput = document.getElementById("notes-add");
    if (!nameInput.value || !specialityInput.value || !countryInput.value ||
        !cityInput.value || !phoneInput.value || !emailInput.value ||
        !dobInput.value || !sexInput) {
        alert("Please fill in all required fields marked with *");
        return;
    }
    if (!/^[a-zA-Zа-яА-ЯІіЇїЄє\s'-]+$/.test(nameInput.value)) {
        alert("Name should only contain letters, spaces, hyphens, or apostrophes.");
        return;
    }
    if (!/^[a-zA-Zа-яА-ЯІіЇїЄє\s'-]+$/.test(countryInput.value)) {
        alert("Country should only contain letters, spaces, hyphens, or apostrophes.");
        return;
    }
    if (!/^[a-zA-Zа-яА-ЯІіЇїЄє\s'-]+$/.test(cityInput.value)) {
        alert("City should only contain letters, spaces, hyphens, or apostrophes.");
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
        alert("Please enter a valid email address.");
        return;
    }
    const phoneRegex = /^\+?[0-9\s\-()]+$/;
    if (!phoneRegex.test(phoneInput.value)) {
        alert("Please enter a valid phone number.");
        return;
    }
    const calculatedAge = calculateAge(dobInput.value);
    if (calculatedAge < 18) {
        alert("Teacher must be at least 18 years old.");
        return;
    }
    const newTeacher = {
        gender: sexInput.value,
        title: sexInput.value === "male" ? "Mr" : (sexInput.value === "female" ? "Ms" : ""),
        full_name: nameInput.value,
        city: cityInput.value,
        state: "",
        country: countryInput.value,
        postcode: "",
        coordinates: { latitude: "-", longitude: "-" },
        timezone: { offset: "-", description: "-" },
        email: emailInput.value,
        b_date: dobInput.value,
        age: calculatedAge,
        phone: phoneInput.value,
        picture_large: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameInput.value)}&background=random&size=128`,
        picture_thumbnail: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameInput.value)}&background=random&size=48`,
        id: Math.random().toString(36).substring(2, 11),
        favorite: false,
        course: specialityInput.value,
        bg_color: bgColorInput.value || "#fffff",
        note: notesInput.value || null,
        days_until_birthday: calculateDaysUntilBirthday(dobInput.value)
    };
    try {
        const response = await fetch('http://localhost:3001/teachers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTeacher),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save teacher');
        }
        users.unshift(newTeacher);
        if (hasActiveFilters()) {
            filterUsers();
        }
        else {
            updateAllViews();
        }
        addTeacherModal.style.display = "none";
        resetAddTeacherForm();
        alert('Teacher added successfully!');
    }
    catch (error) {
        console.error('Error adding teacher:', error);
        alert(`Error adding teacher: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
};
const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate()))
        age--;
    return age;
};
const resetAddTeacherForm = () => {
    const form = document.getElementById("addTeacherForm");
    if (form)
        form.reset();
    const coursesDatalist = document.getElementById("coursesDatalist");
    if (coursesDatalist) {
        coursesDatalist.innerHTML = courses.map(course => `<option value="${course}"></option>`).join('');
    }
};
const setupAddTeacherForm = () => {
    const addButton = document.querySelector(".pop-add-footer .add-button");
    addButton === null || addButton === void 0 ? void 0 : addButton.addEventListener("click", (e) => {
        e.preventDefault();
        addNewTeacher();
    });
};
const setupSearch = () => {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (!searchTerm) {
            if (hasActiveFilters()) {
                filterUsers();
            }
            else {
                filteredUsers = [];
                updateAllViews();
            }
            return;
        }
        let tempFiltered = [...users];
        const ageFilterVal = document.getElementById("age").value;
        const regionFilterVal = document.getElementById("region").value;
        const sexFilterVal = document.getElementById("sex").value;
        const onlyWithPhotoVal = document.getElementById("onlyWithPhoto").checked;
        const onlyFavoritesVal = document.getElementById("onlyFavorites").checked;
        if (onlyFavoritesVal)
            tempFiltered = tempFiltered.filter(u => u.favorite);
        if (onlyWithPhotoVal)
            tempFiltered = tempFiltered.filter(u => u.picture_large && u.picture_large !== "-" && u.picture_large !== "img/placeholder.png");
        if (ageFilterVal !== "All") {
            switch (ageFilterVal) {
                case "18-31":
                    tempFiltered = tempFiltered.filter(user => user.age >= 18 && user.age <= 31);
                    break;
                case "32-45":
                    tempFiltered = tempFiltered.filter(user => user.age >= 32 && user.age <= 45);
                    break;
                case "46+":
                    tempFiltered = tempFiltered.filter(user => user.age >= 46);
                    break;
            }
        }
        if (regionFilterVal !== "All") {
            const regionsData = {
                "Europe": ["France", "Germany", "Spain", "Ukraine", "Italy", "United Kingdom", "Ireland", "Switzerland", "Norway", "Denmark", "Finland", "Netherlands", "Belgium", "Austria", "Poland", "Portugal", "Sweden", "Czech Republic", "Hungary", "Romania", "Greece", "Serbia", "Croatia", "Slovakia", "Bulgaria", "Lithuania", "Latvia", "Estonia", "Slovenia", "Luxembourg", "Cyprus", "Malta", "Iceland"],
                "Asia": ["China", "Japan", "India", "Thailand", "South Korea", "Turkey", "Iran", "Iraq", "Israel", "Saudi Arabia", "United Arab Emirates", "Singapore", "Malaysia", "Indonesia", "Philippines", "Vietnam", "Pakistan", "Bangladesh", "Kazakhstan", "Uzbekistan"],
                "North America": ["USA", "Canada", "Mexico", "United States"],
            };
            if (regionFilterVal === "Other") {
                const allListedRegions = Object.values(regionsData).flat();
                tempFiltered = tempFiltered.filter(user => !allListedRegions.includes(user.country) && user.country !== "-");
            }
            else if (regionsData[regionFilterVal]) {
                tempFiltered = tempFiltered.filter(user => regionsData[regionFilterVal].includes(user.country));
            }
        }
        if (sexFilterVal !== "All")
            tempFiltered = tempFiltered.filter(u => u.gender.toLowerCase() === sexFilterVal.toLowerCase());
        filteredUsers = tempFiltered.filter(user => {
            const fullName = user.full_name.toLowerCase();
            const note = user.note ? user.note.toLowerCase() : "";
            const age = user.age.toString();
            return searchTerm.split(' ').every(term => fullName.includes(term) ||
                (user.note && note.includes(term)) ||
                age.includes(term));
        });
        currentPage = 1;
        updateAllViews();
    };
    searchForm === null || searchForm === void 0 ? void 0 : searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        performSearch();
    });
    searchInput === null || searchInput === void 0 ? void 0 : searchInput.addEventListener("input", performSearch);
    const mobileSearchForm = document.querySelector(".mobile-menu form");
    const mobileSearchInput = document.querySelector(".mobile-menu input[type='text']");
    mobileSearchForm === null || mobileSearchForm === void 0 ? void 0 : mobileSearchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (mobileSearchInput) {
            searchInput.value = mobileSearchInput.value;
            performSearch();
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu)
                mobileMenu.classList.remove('active');
        }
    });
    mobileSearchInput === null || mobileSearchInput === void 0 ? void 0 : mobileSearchInput.addEventListener("input", () => {
        if (mobileSearchInput) {
            searchInput.value = mobileSearchInput.value;
            performSearch();
        }
    });
};
const initBurgerMenu = () => {
    const burger = document.querySelector('.burger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenuButton = document.querySelector('.close-menu');
    _.invoke(burger, 'addEventListener', 'click', () => _.invoke(mobileMenu.classList, 'toggle', 'active'));
    _.invoke(closeMenuButton, 'addEventListener', 'click', () => _.invoke(mobileMenu.classList, 'remove', 'active'));
    _.forEach(mobileMenu === null || mobileMenu === void 0 ? void 0 : mobileMenu.querySelectorAll('a, button.button-add'), item => {
        _.invoke(item, 'addEventListener', 'click', () => _.invoke(mobileMenu.classList, 'remove', 'active'));
    });
};
const initApp = async () => {
    users = await fetchUsers();
    if (users.length === 0) {
        console.warn("No users loaded. Adding a default user.");
        users = [{
                gender: "male",
                name: { title: "Mr", first: "John", last: "Doe (Default)" },
                location: {
                    city: "New York",
                    state: "NY",
                    country: "USA",
                    postcode: "10001",
                    coordinates: { latitude: "40.7128", longitude: "-74.0060" },
                    timezone: { offset: "-5:00", description: "Eastern Time" }
                },
                email: "john.doe@example.com",
                dob: { date: "1985-01-15T00:00:00Z", age: calculateAge("1985-01-15") },
                phone: "+1 555-123-4567",
                picture: { large: "img/placeholder.png", thumbnail: "img/placeholder-thumb.png" },
                login: { uuid: "default-user-1" }
            }].map(user => normalizeUser(user));
    }
    currentPage = 1;
    updateAllViews();
    setupTableSorting();
    setupFilters();
    initModals();
    setupAddTeacherForm();
    setupSearch();
    initBurgerMenu();
    const scrollLeft = document.querySelector('.scroll-button.left');
    const scrollRight = document.querySelector('.scroll-button.right');
    scrollLeft === null || scrollLeft === void 0 ? void 0 : scrollLeft.addEventListener('click', () => favoritesContainer === null || favoritesContainer === void 0 ? void 0 : favoritesContainer.scrollBy({ left: -200, behavior: 'smooth' }));
    scrollRight === null || scrollRight === void 0 ? void 0 : scrollRight.addEventListener('click', () => favoritesContainer === null || favoritesContainer === void 0 ? void 0 : favoritesContainer.scrollBy({ left: 200, behavior: 'smooth' }));
};
window.toggleMap = (user) => {
    const { latitude, longitude } = user.coordinates || { latitude: "-", longitude: "-" };
    const mapDiv = document.getElementById('map');
    if (window.teacherMap) {
        window.teacherMap.remove();
        window.teacherMap = undefined;
    }
    if (mapDiv) {
        if (latitude && longitude && latitude !== "-" && longitude !== "-") {
            mapDiv.style.height = '200px';
            mapDiv.style.display = 'block';
            mapDiv.style.marginTop = '85px';
            mapDiv.style.width = '400px';
            mapDiv.style.marginLeft = '40px';
            setTimeout(() => {
                if (!window.teacherMap) {
                    try {
                        window.teacherMap = L.map(mapDiv).setView([parseFloat(latitude), parseFloat(longitude)], 10);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; OpenStreetMap contributors'
                        }).addTo(window.teacherMap);
                        L.marker([parseFloat(latitude), parseFloat(longitude)]).addTo(window.teacherMap)
                            .bindPopup(user.full_name)
                            .openPopup();
                        window.teacherMap.invalidateSize();
                    }
                    catch (e) {
                        console.error("Leaflet error:", e);
                        mapDiv.innerHTML = '<p>Map error. Coordinates might be invalid.</p>';
                        mapDiv.style.height = 'auto';
                    }
                }
                else {
                    window.teacherMap.setView([parseFloat(latitude), parseFloat(longitude)], 10);
                    window.teacherMap.eachLayer((layer) => {
                        var _a;
                        if (layer instanceof L.Marker)
                            (_a = window.teacherMap) === null || _a === void 0 ? void 0 : _a.removeLayer(layer);
                    });
                    L.marker([parseFloat(latitude), parseFloat(longitude)]).addTo(window.teacherMap)
                        .bindPopup(user.full_name)
                        .openPopup();
                    window.teacherMap.invalidateSize();
                }
            }, 100);
        }
        else {
            mapDiv.innerHTML = '<p>No coordinates available for this teacher.</p>';
            mapDiv.style.height = 'auto';
            mapDiv.style.marginTop = '15px';
        }
    }
    else {
        console.error("Map container not found");
    }
};
window.addEventListener('DOMContentLoaded', initApp);

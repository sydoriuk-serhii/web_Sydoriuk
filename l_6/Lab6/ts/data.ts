"use strict";

// Глобальні оголошення для бібліотек, завантажених через <script>
declare const dayjs: any;
declare const L: any;
declare const Chart: any;

// Розширення глобального інтерфейсу Window
declare global {
    interface Window {
        teacherMap?: L.Map;
        toggleMap: (user: User) => void;
    }
}

import * as _ from 'lodash';

interface User {
    gender: string;
    title: string;
    full_name: string;
    city: string;
    state: string;
    country: string;
    postcode: string;
    coordinates: { latitude: string; longitude: string };
    timezone: { offset: string; description: string };
    email: string;
    b_date: string; // MM-DD
    age: number;
    phone: string;
    picture_large: string;
    picture_thumbnail: string;
    id: string;
    favorite: boolean;
    course: string;
    bg_color: string;
    note: string | null;
    days_until_birthday: string;
}

const generateRandomBirthday = (): string => {
    const month = _.random(1, 12);
    const day = _.random(1, 28);
    return `${_.padStart(String(month), 2, '0')}-${_.padStart(String(day), 2, '0')}`;
};

const courses = [
    "Mathematics", "Physics", "English", "Computer Science", "Dancing",
    "Chess", "Biology", "Chemistry", "Law", "Art", "Medicine", "Statistics"
];

const ITEMS_PER_PAGE = 10;

const getRandomCourse = (): string => _.sample(courses) || "Unknown Course";

const calculateAge = (birthDateFull: string): number => { // Expects YYYY-MM-DD
    if (_.isEmpty(birthDateFull) || !dayjs(birthDateFull, 'YYYY-MM-DD', true).isValid()) return 0;
    return dayjs().diff(dayjs(birthDateFull), 'year');
};

const calculateDaysUntilBirthday = (birthdayMMDD: string): string => { // Expects MM-DD
    if (_.isEmpty(birthdayMMDD) || birthdayMMDD === "-" || !/^\d{2}-\d{2}$/.test(birthdayMMDD)) {
        return "-";
    }
    try {
        const today = dayjs();
        const currentYear = today.year();
        const [monthStr, dayStr] = birthdayMMDD.split('-');
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);
        if (month < 1 || month > 12 || day < 1 || day > 31) return "-";
        let nextBirthday = dayjs(`${currentYear}-${monthStr}-${dayStr}`);
        if (!nextBirthday.isValid()) return "-";
        if (nextBirthday.isBefore(today, 'day')) {
            nextBirthday = nextBirthday.add(1, 'year');
        }
        const daysLeft = nextBirthday.diff(today, 'day');
        return `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
    } catch (e) {
        console.error("Error calculating days until birthday:", e);
        return "-";
    }
};

const normalizeUser = (user: any): User => {
    const dobDateAPI = _.get(user, 'dob.date');
    const bDateLocal = _.get(user, 'b_date');
    const ageAPI = _.get(user, 'dob.age');
    const ageLocal = _.get(user, 'age');

    let final_b_date_mm_dd: string;
    let final_age: number;

    if (dobDateAPI) {
        final_b_date_mm_dd = dayjs(dobDateAPI).format('MM-DD');
        final_age = ageAPI || calculateAge(dayjs(dobDateAPI).format('YYYY-MM-DD'));
    } else if (bDateLocal) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(bDateLocal)) {
            final_b_date_mm_dd = dayjs(bDateLocal).format('MM-DD');
            final_age = ageLocal || calculateAge(bDateLocal);
        } else if (/^\d{2}-\d{2}$/.test(bDateLocal)) {
            final_b_date_mm_dd = bDateLocal;
            final_age = ageLocal || 0;
        } else {
            final_b_date_mm_dd = generateRandomBirthday();
            final_age = ageLocal || _.random(20, 50);
        }
    } else {
        final_b_date_mm_dd = generateRandomBirthday();
        final_age = ageLocal || _.get(user, 'dob.age') || _.random(20, 50);
    }

    if(final_age === 0 && dobDateAPI) {
        final_age = calculateAge(dayjs(dobDateAPI).format('YYYY-MM-DD'));
    } else if (final_age === 0 && bDateLocal && /^\d{4}-\d{2}-\d{2}$/.test(bDateLocal)) {
        final_age = calculateAge(bDateLocal);
    }

    return {
        gender: _.get(user, 'gender', '-'),
        title: _.get(user, 'name.title', '-'),
        full_name: `${_.get(user, 'name.first', '-')} ${_.get(user, 'name.last', '-')}`,
        city: _.get(user, 'location.city', '-'),
        state: _.get(user, 'location.state', '-'),
        country: _.get(user, 'location.country', '-'),
        postcode: _.toString(_.get(user, 'location.postcode', '-')),
        coordinates: {
            latitude: _.toString(_.get(user, 'location.coordinates.latitude', '-')),
            longitude: _.toString(_.get(user, 'location.coordinates.longitude', '-')),
        },
        timezone: _.get(user, 'location.timezone', { offset: "-", description: "-" }),
        email: _.get(user, 'email', '-'),
        b_date: final_b_date_mm_dd,
        age: final_age,
        phone: _.get(user, 'phone', '-'),
        picture_large: _.get(user, 'picture.large', 'img/placeholder.png'),
        picture_thumbnail: _.get(user, 'picture.thumbnail', 'img/placeholder-thumb.png'),
        id: _.get(user, 'login.uuid', _.get(user, 'id', _.uniqueId('user_'))),
        favorite: _.get(user, 'favorite', false),
        course: _.get(user, 'course', getRandomCourse()),
        bg_color: _.get(user, 'bg_color', '#ffffff'),
        note: _.get(user, 'note', null),
        days_until_birthday: calculateDaysUntilBirthday(final_b_date_mm_dd),
    };
};

const fetchUsers = async (): Promise<User[]> => {
    try {
        const localResponse = await fetch('http://localhost:3001/teachers');
        if (localResponse.ok) {
            const localData = await localResponse.json();
            if (!_.isEmpty(localData)) {
                return _.map(localData, (dbUser: any) => normalizeUser(dbUser));
            }
        }
    } catch (error) {
        console.warn('Could not fetch from local server:', error);
    }

    try {
        const response = await fetch('https://randomuser.me/api/?results=50');
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        const data = await response.json();
        return _.map(_.get(data, 'results', []), (apiUser: any) => normalizeUser(apiUser));
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

let users: User[] = [];
let filteredUsers: User[] = [];
let currentPage = 1;
let currentSortColumn: string | null = null;
let currentSortDirection: 'asc' | 'desc' = 'asc';

const container = document.getElementById("users-container");
const filtersSection = document.querySelector(".filters");
const favoritesContainer = document.getElementById("favorites-list");
const paginationContainer = document.getElementById("topTeachersPagination");
const addTeacherModal = document.querySelector(".pop-add") as HTMLElement;
const teacherModal = document.getElementById("teacherModal") as HTMLElement;

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

let chartInstances: { courseChart: Chart | null; regionChart: Chart | null; } = {
    courseChart: null,
    regionChart: null
};

const toggleFavorite = async (userId: string): Promise<void> => {
    const userIndex = _.findIndex(users, (u: User) => u.id === userId);
    if (userIndex === -1) return;
    users[userIndex].favorite = !users[userIndex].favorite;
    const filteredUserIndex = _.findIndex(filteredUsers, (u: User) => u.id === userId);
    if (filteredUserIndex !== -1) {
        filteredUsers[filteredUserIndex].favorite = users[userIndex].favorite;
    }
    try {
        const response = await fetch(`http://localhost:3001/teachers/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorite: users[userIndex].favorite }),
        });
        if (!response.ok) { // Rollback on error
            users[userIndex].favorite = !users[userIndex].favorite;
            if (filteredUserIndex !== -1) {
                filteredUsers[filteredUserIndex].favorite = users[userIndex].favorite;
            }
        }
        updateAllViews();
    } catch (error) {
        console.error('Error updating favorite:', error);
        users[userIndex].favorite = !users[userIndex].favorite; // Rollback on exception
        if (filteredUserIndex !== -1) {
            filteredUsers[filteredUserIndex].favorite = users[userIndex].favorite;
        }
        updateAllViews();
    }
};

const updateAllViews = (): void => {
    const usersToProcess = !_.isEmpty(filteredUsers) || hasActiveFilters() ? filteredUsers : users;
    renderUsers(usersToProcess);
    renderStatisticsCharts(usersToProcess);
    renderFavorites();
    renderPagination(usersToProcess, paginationContainer, 'cards');
};

const renderFavorites = (): void => {
    if (!favoritesContainer) return;
    const favoriteUsers = _.filter(users, (user: User) => user.favorite === true);
    favoritesContainer.innerHTML = _.isEmpty(favoriteUsers)
        ? '<p class="no-favorites">No favorite teachers yet</p>'
        : _.map(favoriteUsers, (user: User) => `
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
            if (userId) toggleFavorite(userId);
        });
    });
    document.querySelectorAll('.favorite-item').forEach(item => {
        item.addEventListener('click', () => {
            const userId = item.getAttribute('data-id');
            const user = _.find(users, (u: User) => u.id === userId);
            if (user) openModal(user);
        });
    });
};

const hasActiveFilters = (): boolean => {
    return (document.getElementById("age") as HTMLSelectElement).value !== "All" ||
        (document.getElementById("region") as HTMLSelectElement).value !== "All" ||
        (document.getElementById("sex") as HTMLSelectElement).value !== "All" ||
        (document.getElementById("onlyWithPhoto") as HTMLInputElement).checked ||
        (document.getElementById("onlyFavorites") as HTMLInputElement).checked;
};

const filterUsers = (): void => {
    const ageFilter = (document.getElementById("age") as HTMLSelectElement).value;
    const regionFilter = (document.getElementById("region") as HTMLSelectElement).value;
    const sexFilter = (document.getElementById("sex") as HTMLSelectElement).value;
    const onlyWithPhoto = (document.getElementById("onlyWithPhoto") as HTMLInputElement).checked;
    const onlyFavorites = (document.getElementById("onlyFavorites") as HTMLInputElement).checked;

    filteredUsers = _.filter(users, (user: User) => {
        if (onlyFavorites && !user.favorite) return false;
        if (onlyWithPhoto && (user.picture_large === "img/placeholder.png" || _.isEmpty(user.picture_large))) return false;
        if (sexFilter !== "All" && user.gender.toLowerCase() !== sexFilter.toLowerCase()) return false;
        if (ageFilter !== "All") {
            const age = user.age;
            if (ageFilter === "18-31" && (age < 18 || age > 31)) return false;
            if (ageFilter === "32-45" && (age < 32 || age > 45)) return false;
            if (ageFilter === "46+" && age < 46) return false;
        }
        if (regionFilter !== "All") {
            const regions: Record<string, string[]> = {
                "Europe": ["France", "Germany", "Spain", "Ukraine", "Italy", "United Kingdom", "Ireland", "Switzerland", "Norway", "Denmark", "Finland", "Netherlands", "Belgium", "Austria", "Poland", "Portugal", "Sweden", "Czech Republic", "Hungary", "Romania", "Greece", "Serbia", "Croatia", "Slovakia", "Bulgaria", "Lithuania", "Latvia", "Estonia", "Slovenia", "Luxembourg", "Cyprus", "Malta", "Iceland"],
                "Asia": ["China", "Japan", "India", "Thailand", "South Korea", "Turkey", "Iran", "Iraq", "Israel", "Saudi Arabia", "United Arab Emirates", "Singapore", "Malaysia", "Indonesia", "Philippines", "Vietnam", "Pakistan", "Bangladesh", "Kazakhstan", "Uzbekistan"],
                "North America": ["USA", "Canada", "Mexico", "United States"],
            };
            if (regionFilter === "Other") {
                const allListedRegions = _.flatten(_.values(regions));
                if (_.includes(allListedRegions, user.country) || user.country === "-") return false;
            } else if (regions[regionFilter] && !_.includes(regions[regionFilter], user.country)) {
                return false;
            }
        }
        return true;
    });
    currentPage = 1;
    if (currentSortColumn) {
        sortUsers(currentSortColumn, currentSortDirection, true);
    } else {
        // updateAllViews(); // Не потрібно, бо performSearch викличе updateAllViews після filterUsers
    }
};

const resetFilters = (): void => {
    (document.getElementById("age") as HTMLSelectElement).value = "All";
    (document.getElementById("region") as HTMLSelectElement).value = "All";
    (document.getElementById("sex") as HTMLSelectElement).value = "All";
    (document.getElementById("onlyWithPhoto") as HTMLInputElement).checked = false;
    (document.getElementById("onlyFavorites") as HTMLInputElement).checked = false;
    (document.getElementById("searchInput") as HTMLInputElement).value = "";
    filteredUsers = [];
    currentPage = 1;
    currentSortColumn = null;
    updateAllViews(); // Тут потрібно, бо скидаємо всі фільтри і пошук
};

const setupFilters = (): void => {
    filterButton.addEventListener("click", () => performSearch()); // Фільтри тепер частина performSearch
    resetButton.addEventListener("click", resetFilters);
    ["age", "region", "sex", "onlyWithPhoto", "onlyFavorites"].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.addEventListener("change", () => performSearch()); // Фільтри тепер частина performSearch
    });
};

const getPaginatedData = (data: User[], page: number): User[] => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return _.slice(data, startIndex, startIndex + ITEMS_PER_PAGE);
};

const renderPagination = (data: User[], containerElement: Element | null, type: string): void => {
    if (!containerElement) return;
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    containerElement.innerHTML = '';
    if (totalPages <= 1) return;
    const createButton = (content: string | number, handler: () => void, isDisabled = false, isActive = false) => {
        const button = document.createElement('span');
        button.textContent = String(content);
        button.className = `page-button ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`;
        if (!isDisabled) button.addEventListener('click', handler);
        return button;
    };
    containerElement.appendChild(createButton('«', () => { if (currentPage > 1) { currentPage--; updateAllViews(); } }, currentPage === 1));
    _.times(totalPages, (i: number) => {
        containerElement.appendChild(createButton(i + 1, () => { currentPage = i + 1; updateAllViews(); }, false, (i + 1) === currentPage));
    });
    containerElement.appendChild(createButton('»', () => { if (currentPage < totalPages) { currentPage++; updateAllViews(); } }, currentPage === totalPages));
};

const renderUsers = (usersToRender: User[]): void => {
    if (!container) return;
    const paginatedUsers = getPaginatedData(usersToRender, currentPage);
    container.innerHTML = _.map(paginatedUsers, (user: User) => `
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
            favoriteButton?.addEventListener('click', (e) => { e.stopPropagation(); toggleFavorite(user.id); });
        }
    });
};

const renderStatisticsCharts = (usersToRender: User[]): void => {
    const chartContainer = document.querySelector('.chart-container') as HTMLElement;
    if (!chartContainer) return;
    if (_.isEmpty(usersToRender)) {
        chartContainer.style.display = 'none';
        if (chartInstances.courseChart) { chartInstances.courseChart.destroy(); chartInstances.courseChart = null;}
        if (chartInstances.regionChart) { chartInstances.regionChart.destroy(); chartInstances.regionChart = null;}
        return;
    }
    chartContainer.style.display = 'flex';
    const courseCounts = _.countBy(usersToRender, 'course');
    const countryCountsValid = _.filter(usersToRender, (user: User) => !_.isEmpty(user.country) && user.country !== "-");
    const countryCounts = _.countBy(countryCountsValid, 'country');
    const mappedCountries = _.map(countryCounts, (count: number, country: string) => ({ country, count }));
    const orderedCountries = _.orderBy(mappedCountries, ['count'], ['desc']);
    const sortedCountries = _.take(orderedCountries, 10);
    const courseLabels = _.keys(courseCounts);
    const courseData = _.values(courseCounts);
    const countryLabels = _.map(sortedCountries, 'country');
    const countryData = _.map(sortedCountries, 'count');
    renderPieChart('teachersChart', courseLabels, courseData, 'Teachers by Course');
    if (!_.isEmpty(countryLabels)) {
        renderPieChart('regionChart', countryLabels, countryData, 'Top Countries');
    }  else {
        const regionCanvas = document.getElementById('regionChart') as HTMLCanvasElement;
        if (regionCanvas && chartInstances.regionChart) {
            chartInstances.regionChart.destroy(); chartInstances.regionChart = null;
        }
    }
};

const renderPieChart = (canvasId: string, labels: string[], data: number[], title: string): void => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    const backgroundColors = _.map(labels, (_item: string, index: number) => `hsl(${(index * 360 / labels.length) % 360}, 70%, 60%)`);
    if (canvasId === 'teachersChart' && chartInstances.courseChart) chartInstances.courseChart.destroy();
    else if (canvasId === 'regionChart' && chartInstances.regionChart) chartInstances.regionChart.destroy();
    const newChart = new Chart(canvas, {
        type: 'pie',
        data: { labels: labels, datasets: [{ data: data, backgroundColor: backgroundColors, borderWidth: 1 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12 } },
                title: { display: true, text: title, font: { size: 16 } },
                tooltip: {
                    callbacks: {
                        label: function(context: any) {
                            const label = _.get(context, 'label', '');
                            const value = _.get(context, 'raw', 0);
                            const totalData = _.get(context, 'dataset.data', []);
                            const total = _.sum(totalData);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    if (canvasId === 'teachersChart') chartInstances.courseChart = newChart;
    else if (canvasId === 'regionChart') chartInstances.regionChart = newChart;
};

const sortUsers = (column: string, direction: 'asc' | 'desc', sortFilteredList: boolean = false): void => {
    const listToSort: User[] = sortFilteredList && !_.isEmpty(filteredUsers) ? filteredUsers : users;

    const iteratee = (user: User): any => {
        let value;
        const sortKey = column || currentSortColumn;
        if (!sortKey) return undefined;
        switch (sortKey) {
            case 'name': value = user.full_name; break; // Прямий доступ, бо User типізований
            case 'course': value = user.course; break;
            case 'age': value = user.age; break;
            case 'country': value = user.country; break;
            default: value = _.get(user, sortKey); // _.get для можливих глибоких шляхів або нестандартних ключів
        }
        return _.isString(value) ? _.toLower(value) : value;
    };

    // Використовуємо iteratee безпосередньо, а не в масиві, якщо це один критерій
    const sortedArray = _.orderBy(listToSort, iteratee, direction);

    if (sortFilteredList && !_.isEmpty(filteredUsers)) {
        filteredUsers = sortedArray;
    } else {
        users = sortedArray;
        if (hasActiveFilters()) {
            // filterUsers оновить filteredUsers. Після цього, якщо currentSortColumn встановлено,
            // filterUsers викличе sortUsers(currentSortColumn, currentSortDirection, true)
            // для сортування filteredUsers.
            filterUsers();
            return;
        }
    }
    currentPage = 1;
    updateAllViews();
};

const setupTableSorting = (): void => {
    document.querySelectorAll('#teachers-table th[id^="sort-"]').forEach(header => {
        header.addEventListener('click', () => {
            const columnKey = header.id.replace('sort-', '');
            const isCurrentlyAsc = header.classList.contains('asc');
            const newDirection = isCurrentlyAsc ? 'desc' : 'asc';
            document.querySelectorAll('#teachers-table th').forEach(h => h.classList.remove('asc', 'desc'));
            header.classList.add(newDirection);
            currentSortColumn = columnKey;
            currentSortDirection = newDirection;
            const shouldSortFiltered = !_.isEmpty(filteredUsers) || hasActiveFilters();
            sortUsers(columnKey, newDirection, shouldSortFiltered);
        });
    });
};

const openModal = (user: User): void => {
    if (!teacherModal) return;
    const modalImage = document.getElementById("modalImage") as HTMLImageElement;
    const modalName = document.getElementById("modalName") as HTMLElement;
    const modalSubject = document.getElementById("modalSubject") as HTMLElement;
    const modalCountry = document.getElementById("modalCountry") as HTMLElement;
    const modalAge = document.getElementById("modalAge") as HTMLElement;
    const modalGender = document.getElementById("modalGender") as HTMLElement;
    const modalEmailLink = document.getElementById("modalEmailLink") as HTMLAnchorElement;
    const modalEmail = document.getElementById("modalEmail") as HTMLElement;
    const modalNumber = document.getElementById("modalNumber") as HTMLElement;
    const modalFavoriteButton = document.getElementById("modalFavoriteButton") as HTMLButtonElement;
    const modalBirthdayCountdown = document.getElementById("modalBirthdayCountdown") as HTMLElement;

    modalImage.src = user.picture_large || "img/placeholder.png";
    modalImage.onerror = () => { modalImage.src = "img/placeholder.png"; };
    modalName.textContent = `${user.title} ${user.full_name}`;
    modalSubject.textContent = user.course;
    modalCountry.textContent = user.city ? `${user.city}, ${user.country}` : user.country;
    modalAge.textContent = `${user.age || "-"}`;
    modalGender.textContent = user.gender ? _.startCase(user.gender) : "-";
    modalEmail.textContent = user.email;
    modalEmailLink.href = `mailto:${user.email}`;
    modalNumber.textContent = user.phone;
    modalBirthdayCountdown.textContent = user.days_until_birthday !== "-" ?
        `Birthday in ${user.days_until_birthday}` : "Birthday date not available";
    modalFavoriteButton.textContent = user.favorite ? "★" : "☆";
    modalFavoriteButton.className = `favorite-button ${user.favorite ? 'active' : ''}`;
    const newFavButton = modalFavoriteButton.cloneNode(true) as HTMLButtonElement;
    modalFavoriteButton.parentNode?.replaceChild(newFavButton, modalFavoriteButton);
    newFavButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(user.id).then(() => {
            const latestUser = _.find(users, (u: User) => u.id === user.id);
            if (latestUser) {
                newFavButton.textContent = latestUser.favorite ? "★" : "☆";
                newFavButton.className = `favorite-button ${latestUser.favorite ? 'active' : ''}`;
            }
        });
    });
    teacherModal.style.display = "flex";
    window.toggleMap(user);
};

const initModals = (): void => {
    document.querySelector("#teacherModal .close")?.addEventListener("click", () => {
        teacherModal.style.display = "none";
        if (window.teacherMap) { window.teacherMap.remove(); window.teacherMap = undefined; }
    });
    const addTeacherClose = document.querySelector(".pop-add-header .close");
    addTeacherClose?.addEventListener("click", () => {
        addTeacherModal.style.display = "none"; resetAddTeacherForm();
    });
    const openAddTeacherModal = () => {
        addTeacherModal.style.display = "flex";
        const coursesDatalist = document.getElementById("coursesDatalist");
        if (coursesDatalist) {
            coursesDatalist.innerHTML = _.map(courses, (course: string) => `<option value="${course}"></option>`).join('');
        }
    };
    addTeacherBtnHeader?.addEventListener("click", openAddTeacherModal);
    addTeacherBtnMobile?.addEventListener("click", openAddTeacherModal);
    addTeacherBtnFooter?.addEventListener("click", openAddTeacherModal);
    window.addEventListener("click", (event) => {
        if (event.target === teacherModal) {
            teacherModal.style.display = "none";
            if (window.teacherMap) { window.teacherMap.remove(); window.teacherMap = undefined; }
        }
        if (event.target === addTeacherModal) {
            addTeacherModal.style.display = "none"; resetAddTeacherForm();
        }
    });
};

const addNewTeacher = async (): Promise<void> => {
    const nameInput = document.getElementById("name-add") as HTMLInputElement;
    const specialityInput = document.getElementById("speciality-add") as HTMLInputElement;
    const countryInput = document.getElementById("country-add") as HTMLInputElement;
    const cityInput = document.getElementById("city-add") as HTMLInputElement;
    const phoneInput = document.getElementById("phone-add") as HTMLInputElement;
    const emailInput = document.getElementById("email-add") as HTMLInputElement;
    const dobInput = document.getElementById("dob-add") as HTMLInputElement;
    const sexInput = document.querySelector('input[name="sex-add"]:checked') as HTMLInputElement;
    const bgColorInput = document.getElementById("bg-color-add") as HTMLInputElement;
    const notesInput = document.getElementById("notes-add") as HTMLTextAreaElement;

    const requiredValues = {
        name: nameInput.value, speciality: specialityInput.value, country: countryInput.value,
        city: cityInput.value, phone: phoneInput.value, email: emailInput.value,
        dob: dobInput.value, sex: sexInput ? sexInput.value : null
    };
    const emptyField = _.findKey(requiredValues, value => _.isEmpty(value) && !_.isBoolean(value) && value !== null); // Додано перевірку на null
    if (emptyField) { alert(`Please fill in the ${_.startCase(emptyField)} field correctly.`); return; }

    if (!/^[a-zA-Zа-яА-ЯІіЇїЄєҐґ\s'-]+$/.test(requiredValues.name!)) { alert("Name validation failed."); return; }
    if (!/^[a-zA-Zа-яА-ЯІіЇїЄєҐґ\s'-]+$/.test(requiredValues.country!)) { alert("Country validation failed."); return; }
    if (!/^[a-zA-Zа-яА-ЯІіЇїЄєҐґ\s'-]+$/.test(requiredValues.city!)) { alert("City validation failed."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requiredValues.email!)) { alert("Email validation failed."); return; }
    if (!/^\+?[0-9\s\-()]+$/.test(requiredValues.phone!)) { alert("Phone validation failed."); return; }
    if (!dayjs(requiredValues.dob, 'YYYY-MM-DD', true).isValid()) { alert("Date of birth validation failed."); return; }

    const calculatedAge = calculateAge(requiredValues.dob!);
    if (calculatedAge < 18) { alert("Teacher must be at least 18 years old."); return; }
    const bDateMMDD = dayjs(requiredValues.dob!).format('MM-DD');

    const newTeacher: User = {
        gender: requiredValues.sex!, title: requiredValues.sex === "male" ? "Mr" : (requiredValues.sex === "female" ? "Ms" : ""),
        full_name: requiredValues.name!, city: requiredValues.city!, state: "", country: requiredValues.country!,
        postcode: "", coordinates: { latitude: "-", longitude: "-" }, timezone: { offset: "-", description: "-" },
        email: requiredValues.email!, b_date: bDateMMDD, age: calculatedAge, phone: requiredValues.phone!,
        picture_large: `https://ui-avatars.com/api/?name=${encodeURIComponent(requiredValues.name!)}&background=random&size=128`,
        picture_thumbnail: `https://ui-avatars.com/api/?name=${encodeURIComponent(requiredValues.name!)}&background=random&size=48`,
        id: _.uniqueId('teacher_'), favorite: false, course: specialityInput.value,
        bg_color: bgColorInput.value || "#ffffff", note: notesInput.value || null,
        days_until_birthday: calculateDaysUntilBirthday(bDateMMDD)
    };
    try {
        const response = await fetch('http://localhost:3001/teachers', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTeacher),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(_.get(errorData, 'message', 'Failed to save teacher'));
        }
        users.unshift(newTeacher);
        performSearch();
        addTeacherModal.style.display = "none";
        resetAddTeacherForm();
        alert('Teacher added successfully!');
    } catch (error) {
        console.error('Error adding teacher:', error);
        alert(`Error adding teacher: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
};

const resetAddTeacherForm = (): void => {
    const form = document.getElementById("addTeacherForm") as HTMLFormElement;
    if (form) form.reset();
    const coursesDatalist = document.getElementById("coursesDatalist");
    if (coursesDatalist) {
        coursesDatalist.innerHTML = _.map(courses, (course: string) => `<option value="${course}"></option>`).join('');
    }
};

const setupAddTeacherForm = (): void => {
    const addButton = document.querySelector(".pop-add-footer .add-button");
    addButton?.addEventListener("click", (e) => { e.preventDefault(); addNewTeacher(); });
};

// Оголошуємо performSearch поза setupSearch, щоб debounce міг її "бачити"
// і щоб її можна було викликати з інших місць (напр. setupFilters)
let performSearch = () => {
    const searchInput = document.getElementById("searchInput") as HTMLInputElement;
    const searchTerm = _.toLower(_.trim(searchInput.value));

    // 1. Застосовуємо фільтри (вік, регіон, стать, фото, обране)
    filterUsers(); // Ця функція оновить `filteredUsers` на основі `users` та фільтрів з UI

    // 2. Якщо є пошуковий запит, фільтруємо результат filterUsers
    if (!_.isEmpty(searchTerm)) {
        filteredUsers = _.filter(filteredUsers, (user: User) => {
            const fullName = _.toLower(user.full_name);
            const note = user.note ? _.toLower(user.note) : "";
            const age = _.toString(user.age);
            return _.every(searchTerm.split(' '), termPart =>
                _.includes(fullName, termPart) ||
                (!_.isEmpty(note) && _.includes(note, termPart)) ||
                _.includes(age, termPart)
            );
        });
    }
    // Якщо searchTerm порожній, filteredUsers вже містить результат filterUsers (або users, якщо фільтрів немає)
    currentPage = 1;
    updateAllViews();
};


const setupSearch = (): void => {
    const searchForm = document.getElementById("searchForm") as HTMLFormElement;
    const searchInput = document.getElementById("searchInput") as HTMLInputElement;
    const debouncedSearch = _.debounce(performSearch, 300);

    searchForm?.addEventListener("submit", (e) => {
        e.preventDefault(); debouncedSearch.cancel(); performSearch();
    });
    searchInput?.addEventListener("input", debouncedSearch);

    const mobileSearchForm = document.querySelector(".mobile-menu form");
    const mobileSearchInput = document.querySelector(".mobile-menu input[type='text']") as HTMLInputElement;
    mobileSearchForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        if (mobileSearchInput) {
            searchInput.value = mobileSearchInput.value;
            debouncedSearch.cancel(); performSearch();
            const mobileMenu = document.querySelector('.mobile-menu') as HTMLElement;
            if (mobileMenu) mobileMenu.classList.remove('show-menu');
        }
    });
    mobileSearchInput?.addEventListener("input", () => {
        if (mobileSearchInput) {
            searchInput.value = mobileSearchInput.value;
            debouncedSearch();
        }
    });
};

const initBurgerMenu = (): void => {
    const burger = document.querySelector('.burger-menu');
    const mobileMenu = document.querySelector('.mobile-menu') as HTMLElement;
    const closeMenuButton = document.querySelector('.close-menu');
    _.invoke(burger, 'addEventListener', 'click', () => _.invoke(mobileMenu.classList, 'toggle', 'show-menu'));
    _.invoke(closeMenuButton, 'addEventListener', 'click', () => _.invoke(mobileMenu.classList, 'remove', 'show-menu'));
    _.forEach(mobileMenu?.querySelectorAll('a, button.button-add'), (item: Element) => {
        _.invoke(item, 'addEventListener', 'click', () => _.invoke(mobileMenu.classList, 'remove', 'show-menu'));
    });
};

const initApp = async (): Promise<void> => {
    users = await fetchUsers();
    if (_.isEmpty(users)) {
        console.warn("No users loaded. Adding a default user for demonstration.");
        users = [normalizeUser({
            name: { title: "Mr", first: "John (Default)", last: "Doe" },
            dob: { date: "1985-01-15T00:00:00Z" },
            // Додайте інші мінімально необхідні поля для normalizeUser, якщо потрібно
            email: "default@example.com",
            phone: "123-456-7890",
            location: { country: "USA"}
        } as any)];
    }
    currentPage = 1;
    setupFilters();
    setupSearch();
    performSearch();
    setupTableSorting();
    initModals();
    setupAddTeacherForm();
    initBurgerMenu();
    const scrollLeft = document.querySelector('.favorites-container .scroll-button.left');
    const scrollRight = document.querySelector('.favorites-container .scroll-button.right');
    const favList = document.getElementById('favorites-list');
    scrollLeft?.addEventListener('click', () => favList?.scrollBy({ left: -200, behavior: 'smooth' }));
    scrollRight?.addEventListener('click', () => favList?.scrollBy({ left: 200, behavior: 'smooth' }));
};

window.toggleMap = (user: User) => {
    const latitudeStr = _.get(user, 'coordinates.latitude', '-');
    const longitudeStr = _.get(user, 'coordinates.longitude', '-');
    const mapDiv = document.getElementById('map');
    if (window.teacherMap) { window.teacherMap.remove(); window.teacherMap = undefined; }
    if (mapDiv) {
        const latitude = parseFloat(latitudeStr);
        const longitude = parseFloat(longitudeStr);
        if (!_.isNaN(latitude) && !_.isNaN(longitude) && latitudeStr !== "-" && longitudeStr !== "-") {
            mapDiv.style.height = '200px'; mapDiv.style.display = 'block';
            mapDiv.style.marginTop = '85px'; mapDiv.style.width = '400px';
            mapDiv.style.marginLeft = '40px'; mapDiv.innerHTML = '';
            setTimeout(() => {
                try {
                    window.teacherMap = L.map(mapDiv).setView([latitude, longitude], 10);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors'
                    }).addTo(window.teacherMap!);
                    L.marker([latitude, longitude]).addTo(window.teacherMap!)
                        .bindPopup(user.full_name).openPopup();
                    window.teacherMap!.invalidateSize();
                } catch (e) {
                    console.error("Leaflet error:", e);
                    mapDiv.innerHTML = '<p>Map error. Coordinates might be invalid.</p>';
                    mapDiv.style.height = 'auto';
                }
            }, 100);
        } else {
            mapDiv.innerHTML = '<p>No coordinates available for this teacher.</p>';
            mapDiv.style.height = 'auto'; mapDiv.style.marginTop = '15px';
            mapDiv.style.width = 'auto'; mapDiv.style.marginLeft = '0';
            mapDiv.style.display = 'block';
        }
    } else { console.error("Map container not found"); }
};

window.addEventListener('DOMContentLoaded', initApp);
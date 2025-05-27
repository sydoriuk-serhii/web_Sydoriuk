"use strict";
const courses = [
    "Mathematics", "Physics", "English", "Computer Science", "Dancing",
    "Chess", "Biology", "Chemistry", "Law", "Art", "Medicine", "Statistics"
];
const ITEMS_PER_PAGE = 10;
const getRandomCourse = () => courses[Math.floor(Math.random() * courses.length)];
const normalizeUser = (user) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    return ({
        gender: user.gender || "-",
        title: ((_a = user.name) === null || _a === void 0 ? void 0 : _a.title) || "-",
        full_name: `${((_b = user.name) === null || _b === void 0 ? void 0 : _b.first) || "-"} ${((_c = user.name) === null || _c === void 0 ? void 0 : _c.last) || "-"}`,
        city: ((_d = user.location) === null || _d === void 0 ? void 0 : _d.city) || "-",
        state: ((_e = user.location) === null || _e === void 0 ? void 0 : _e.state) || "-",
        country: ((_f = user.location) === null || _f === void 0 ? void 0 : _f.country) || "-",
        postcode: ((_h = (_g = user.location) === null || _g === void 0 ? void 0 : _g.postcode) === null || _h === void 0 ? void 0 : _h.toString()) || "-",
        coordinates: ((_j = user.location) === null || _j === void 0 ? void 0 : _j.coordinates) || { latitude: "-", longitude: "-" },
        timezone: ((_k = user.location) === null || _k === void 0 ? void 0 : _k.timezone) || { offset: "-", description: "-" },
        email: user.email || "-",
        b_date: ((_l = user.dob) === null || _l === void 0 ? void 0 : _l.date) || "-",
        age: ((_m = user.dob) === null || _m === void 0 ? void 0 : _m.age) || 0,
        phone: user.phone || "-",
        picture_large: ((_o = user.picture) === null || _o === void 0 ? void 0 : _o.large) || "-",
        picture_thumbnail: ((_p = user.picture) === null || _p === void 0 ? void 0 : _p.thumbnail) || "-",
        id: ((_q = user.login) === null || _q === void 0 ? void 0 : _q.uuid) || Math.random().toString(36).substring(2, 9),
        favorite: false,
        course: getRandomCourse(),
        bg_color: "#fffff",
        note: null
    });
};
const fetchUsers = async () => {
    var _a;
    try {
        const localResponse = await fetch('http://localhost:3001/teachers');
        const localData = await localResponse.json();
        if (localData.length > 0) {
            return localData;
        }
        const response = await fetch('https://randomuser.me/api/?results=50');
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
const container = document.getElementById("users-container");
const filtersSection = document.querySelector(".filters");
const favoritesContainer = document.getElementById("favorites-list");
const paginationContainer = document.querySelector(".pagination");
const tablePaginationContainer = document.querySelector(".table-pagination");
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
const addTeacherButton = document.createElement("button");
addTeacherButton.textContent = "Add Teacher";
addTeacherButton.className = "button-add";
addTeacherButton.id = "addTeacherBtn";
if (filtersSection) {
    filtersSection.appendChild(filterButton);
    filtersSection.appendChild(resetButton);
}
const initModals = () => {
    var _a;
    (_a = document.querySelector(".close")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        teacherModal.style.display = "none";
    });
    const addTeacherClose = document.querySelector(".pop-add-header .close");
    addTeacherClose === null || addTeacherClose === void 0 ? void 0 : addTeacherClose.addEventListener("click", () => {
        addTeacherModal.style.display = "none";
    });
    addTeacherButton.addEventListener("click", () => {
        addTeacherModal.style.display = "block";
    });
    window.addEventListener("click", (event) => {
        if (event.target === teacherModal) {
            teacherModal.style.display = "none";
        }
        if (event.target === addTeacherModal) {
            addTeacherModal.style.display = "none";
        }
    });
};
const toggleFavorite = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user)
        return;
    user.favorite = !user.favorite;
    try {
        await fetch(`http://localhost:3001/teachers/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ favorite: user.favorite }),
        });
        updateAllViews();
    }
    catch (error) {
        console.error('Error updating favorite status:', error);
        user.favorite = !user.favorite;
    }
};
const updateAllViews = () => {
    const usersToRender = filteredUsers.length > 0 ? filteredUsers : users;
    renderUsers(usersToRender);
    renderStatisticsTable(usersToRender);
    renderFavorites();
    renderPagination(usersToRender, paginationContainer, 'cards');
    renderPagination(usersToRender, tablePaginationContainer, 'table');
};
const renderFavorites = () => {
    if (!favoritesContainer)
        return;
    const favoriteUsers = users.filter(user => user.favorite);
    favoritesContainer.innerHTML = favoriteUsers.length === 0
        ? '<p class="no-favorites">No favorite teachers yet</p>'
        : favoriteUsers.map(user => `
            <div class="favorite-item">
                <img src="${user.picture_thumbnail}" alt="${user.full_name}" class="favorite-image">
                <div class="favorite-info">
                    <h4>${user.full_name}</h4>
                    <p>${user.course}</p>
                </div>
                <button class="favorite-button" data-id="${user.id}">★</button>
            </div>
        `).join('');
    document.querySelectorAll('.favorite-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const userId = button.getAttribute('data-id');
            if (userId)
                toggleFavorite(userId);
        });
    });
};
const filterUsers = () => {
    const ageFilter = document.getElementById("age").value;
    const regionFilter = document.getElementById("region").value;
    const sexFilter = document.getElementById("sex").value;
    const onlyWithPhoto = document.getElementById("onlyWithPhoto").checked;
    const onlyFavorites = document.getElementById("onlyFavorites").checked;
    filteredUsers = [...users];
    if (onlyFavorites) {
        filteredUsers = filteredUsers.filter(user => user.favorite);
    }
    if (onlyWithPhoto) {
        filteredUsers = filteredUsers.filter(user => user.picture_large !== "-");
    }
    if (ageFilter !== "All") {
        switch (ageFilter) {
            case "18-31":
                filteredUsers = filteredUsers.filter(user => user.age >= 18 && user.age <= 31);
                break;
            case "32-45":
                filteredUsers = filteredUsers.filter(user => user.age >= 32 && user.age <= 45);
                break;
            case "46+":
                filteredUsers = filteredUsers.filter(user => user.age >= 46);
                break;
        }
    }
    if (regionFilter !== "All") {
        const regions = {
            "Europe": ["France", "Germany", "Spain", "Ukraine", "Italy"],
            "Asia": ["China", "Japan", "India", "Thailand", "South Korea"],
            "North America": ["USA", "Canada", "Mexico"]
        };
        if (regionFilter === "Other") {
            const allRegions = Object.keys(regions).reduce((acc, key) => [...acc, ...regions[key]], []);
            filteredUsers = filteredUsers.filter(user => !allRegions.includes(user.country));
        }
        else {
            filteredUsers = filteredUsers.filter(user => { var _a, _b; return (_b = (_a = regions[regionFilter]) === null || _a === void 0 ? void 0 : _a.includes(user.country)) !== null && _b !== void 0 ? _b : false; });
        }
    }
    if (sexFilter !== "All") {
        filteredUsers = filteredUsers.filter(user => user.gender.toLowerCase() === sexFilter.toLowerCase());
    }
    currentPage = 1;
    updateAllViews();
};
const resetFilters = () => {
    document.getElementById("age").value = "All";
    document.getElementById("region").value = "All";
    document.getElementById("sex").value = "All";
    document.getElementById("onlyWithPhoto").checked = false;
    document.getElementById("onlyFavorites").checked = false;
    filteredUsers = [];
    currentPage = 1;
    updateAllViews();
};
const setupFilters = () => {
    filterButton.addEventListener("click", filterUsers);
    resetButton.addEventListener("click", resetFilters);
    const filterElements = ["age", "region", "sex", "onlyWithPhoto", "onlyFavorites"];
    filterElements.forEach(id => {
        var _a;
        (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.addEventListener("change", filterUsers);
    });
};
const getPaginatedData = (data, page) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
};
const renderPagination = (data, container, type) => {
    if (!container)
        return;
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    container.innerHTML = '';
    if (totalPages <= 1)
        return;
    const createButton = (content, handler, disabled = false) => {
        const button = document.createElement('span');
        button.textContent = content;
        button.className = `page-button ${disabled ? 'disabled' : ''}`;
        if (!disabled)
            button.addEventListener('click', handler);
        return button;
    };
    container.appendChild(createButton('«', () => { currentPage--; updateAllViews(); }, currentPage === 1));
    for (let i = 1; i <= totalPages; i++) {
        const button = createButton(i.toString(), () => {
            currentPage = i;
            updateAllViews();
        });
        button.className += i === currentPage ? ' active' : '';
        container.appendChild(button);
    }
    container.appendChild(createButton('»', () => { currentPage++; updateAllViews(); }, currentPage === totalPages));
};
const renderUsers = (usersToRender = users) => {
    if (!container)
        return;
    const paginatedUsers = getPaginatedData(usersToRender, currentPage);
    container.innerHTML = paginatedUsers.map(user => `
        <div class="user-card">
            <img src="${user.picture_thumbnail}" alt="${user.full_name}" class="user-image">
            <div class="user-info">
                <h3>${user.full_name}</h3>
                <p>${user.course}</p>
                <p>${user.country}, ${user.age} years</p>
            </div>
            <button class="favorite-button" data-id="${user.id}">
                ${user.favorite ? '★' : '☆'}
            </button>
        </div>
    `).join('');
    document.querySelectorAll('.user-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            openModal(paginatedUsers[index]);
        });
    });
    document.querySelectorAll('.favorite-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const userId = button.getAttribute('data-id');
            if (userId)
                toggleFavorite(userId);
        });
    });
};
const renderStatisticsTable = (usersToRender = users) => {
    const tableBody = document.querySelector('#teachers-table tbody');
    if (!tableBody)
        return;
    const paginatedUsers = getPaginatedData(usersToRender, currentPage);
    tableBody.innerHTML = paginatedUsers.map(user => `
        <tr>
            <td>${user.full_name}</td>
            <td>${user.course}</td>
            <td>${user.age}</td>
            <td>${user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</td>
            <td>${user.country}</td>
        </tr>
    `).join('');
};
const setupTableSorting = () => {
    document.querySelectorAll('#teachers-table th').forEach(header => {
        header.addEventListener('click', () => {
            const column = header.id.replace('sort-', '');
            const direction = header.classList.contains('asc') ? 'desc' : 'asc';
            document.querySelectorAll('#teachers-table th').forEach(h => {
                h.classList.remove('asc', 'desc');
            });
            header.classList.add(direction);
            const usersToSort = [...(filteredUsers.length > 0 ? filteredUsers : users)];
            usersToSort.sort((a, b) => {
                const valA = column === 'age' ? a.age :
                    column === 'name' ? a.full_name.toLowerCase() :
                        column === 'course' ? a.course.toLowerCase() :
                            column === 'gender' ? a.gender.toLowerCase() :
                                a.country.toLowerCase();
                const valB = column === 'age' ? b.age :
                    column === 'name' ? b.full_name.toLowerCase() :
                        column === 'course' ? b.course.toLowerCase() :
                            column === 'gender' ? b.gender.toLowerCase() :
                                b.country.toLowerCase();
                return direction === 'asc'
                    ? valA > valB ? 1 : -1
                    : valA < valB ? 1 : -1;
            });
            filteredUsers = filteredUsers.length > 0 ? usersToSort : [];
            currentPage = 1;
            updateAllViews();
        });
    });
};
const openModal = (user) => {
    if (!teacherModal)
        return;
    const modalImage = document.getElementById("modalImage");
    const modalName = document.getElementById("modalName");
    const modalSubject = document.getElementById("modalSubject");
    const modalCountry = document.getElementById("modalCountry");
    const modalAge = document.getElementById("modalAge");
    const modalEmail = document.getElementById("modalEmail");
    const modalNumber = document.getElementById("modalNumber");
    const modalFavoriteButton = document.getElementById("modalFavoriteButton");
    modalImage.src = user.picture_large;
    modalName.textContent = `${user.title} ${user.full_name}`;
    modalSubject.textContent = user.course;
    modalCountry.textContent = user.country;
    modalAge.textContent = `${user.age}`;
    modalEmail.textContent = user.email;
    modalNumber.textContent = user.phone;
    modalFavoriteButton.textContent = user.favorite ? "★" : "☆";
    modalFavoriteButton.onclick = (e) => {
        e.stopPropagation();
        toggleFavorite(user.id);
        modalFavoriteButton.textContent = user.favorite ? "★" : "☆";
    };
    teacherModal.style.display = "flex";
};
const addNewTeacher = async () => {
    const nameInput = document.getElementById("name");
    const specialityInput = document.getElementById("speciality");
    const countryInput = document.getElementById("country");
    const cityInput = document.getElementById("city");
    const phoneInput = document.getElementById("phone");
    const emailInput = document.getElementById("email");
    const dobInput = document.getElementById("dob");
    const sexInput = document.querySelector('input[name="sex"]:checked');
    const bgColorInput = document.getElementById("bg-color");
    const notesInput = document.getElementById("notes");
    if (!nameInput.value || !specialityInput.value || !countryInput.value ||
        !cityInput.value || !phoneInput.value || !emailInput.value ||
        !dobInput.value || !sexInput) {
        alert("Please fill in all required fields");
        return;
    }
    const newTeacher = {
        gender: sexInput.value,
        title: "",
        full_name: nameInput.value,
        city: cityInput.value,
        state: "",
        country: countryInput.value,
        postcode: "",
        coordinates: { latitude: "-", longitude: "-" },
        timezone: { offset: "-", description: "-" },
        email: emailInput.value,
        b_date: dobInput.value,
        age: calculateAge(dobInput.value),
        phone: phoneInput.value,
        picture_large: "https://randomuser.me/api/portraits/lego/1.jpg",
        picture_thumbnail: "https://randomuser.me/api/portraits/lego/1.jpg",
        id: Math.random().toString(36).substring(2, 9),
        favorite: false,
        course: specialityInput.value,
        bg_color: bgColorInput.value || "#fffff",
        note: notesInput.value || null
    };
    try {
        const response = await fetch('http://localhost:3001/teachers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTeacher),
        });
        if (!response.ok) {
            throw new Error('Failed to save teacher');
        }
        users.unshift(newTeacher);
        addTeacherModal.style.display = "none";
        resetAddTeacherForm();
        updateAllViews();
        alert('Teacher added successfully!');
    }
    catch (error) {
        console.error('Error adding teacher:', error);
        alert('Error adding teacher. Please try again.');
    }
};
const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }
    return age;
};
const resetAddTeacherForm = () => {
    const form = document.querySelector(".pop-add-body form");
    if (form) {
        form.reset();
    }
};
const setupAddTeacherForm = () => {
    const addButton = document.querySelector(".pop-add-footer .add-button");
    addButton === null || addButton === void 0 ? void 0 : addButton.addEventListener("click", (e) => {
        e.preventDefault();
        addNewTeacher();
    });
};
const initApp = async () => {
    users = await fetchUsers();
    currentPage = 1;
    if (users.length === 0) {
        users = [{
                gender: "male",
                name: { title: "Mr", first: "John", last: "Doe" },
                location: {
                    city: "New York",
                    state: "NY",
                    country: "USA",
                    postcode: "10001",
                    coordinates: { latitude: "40.7128", longitude: "-74.0060" },
                    timezone: { offset: "-5:00", description: "Eastern Time" }
                },
                email: "john.doe@example.com",
                dob: { date: "1985-01-15T00:00:00Z", age: 38 },
                phone: "+1 555-123-4567",
                picture: {
                    large: "https://randomuser.me/api/portraits/men/1.jpg",
                    thumbnail: "https://randomuser.me/api/portraits/men/1-thumb.jpg"
                },
                login: { uuid: "1" }
            }].map(normalizeUser);
    }
    updateAllViews();
    setupTableSorting();
    setupFilters();
    initModals();
    setupAddTeacherForm();
    const scrollLeft = document.querySelector('.scroll-button.left');
    const scrollRight = document.querySelector('.scroll-button.right');
    scrollLeft === null || scrollLeft === void 0 ? void 0 : scrollLeft.addEventListener('click', () => {
        favoritesContainer === null || favoritesContainer === void 0 ? void 0 : favoritesContainer.scrollBy({ left: -200, behavior: 'smooth' });
    });
    scrollRight === null || scrollRight === void 0 ? void 0 : scrollRight.addEventListener('click', () => {
        favoritesContainer === null || favoritesContainer === void 0 ? void 0 : favoritesContainer.scrollBy({ left: 200, behavior: 'smooth' });
    });
};
window.addEventListener('DOMContentLoaded', initApp);

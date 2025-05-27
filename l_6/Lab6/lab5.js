import { formatRandomUser, validateUser } from "./lab3.js";

let users = [];
let filteredUsers = [];

document.addEventListener("DOMContentLoaded", () => {
    getRandomUsers();

    document.getElementById("age").addEventListener("change", applyFilters);
    document.getElementById("country").addEventListener("change", applyFilters);
    document.getElementById("sex").addEventListener("change", applyFilters);
    document.getElementById("only-favourite").addEventListener("change", applyFilters);
});

// Task 1

function getRandomUsers() {
    fetch("https://randomuser.me/api/?results=50")
        .then(response => response.json())
        .then(data => {
            const randomUsers = data.results;
            console.log("Random users: ", randomUsers);

            const formattedUsers = randomUsers.map((user, index) => formatRandomUser(user, index + 1));
            users = formattedUsers;
            filteredUsers = [...users];
            console.log("Formatted random users: ", formattedUsers);

            renderTeachers(filteredUsers);
            renderFavorites(users);
            renderStatistics(users);
        })
        .catch(error => {
            console.error("Error occured during API query:", error);
        });
}

// Task 3

function loadMoreUsers(count = 10) {
    fetch(`https://randomuser.me/api/?results=${count}`)
        .then(response => response.json())
        .then(data => {
            const newUsers = data.results.map((user, index) =>
                formatRandomUser(user, users.length + index + 1)
            );

            users.push(...newUsers);
            filteredUsers = [...users];

            renderTeachers(filteredUsers);
            renderFavorites(users);
            renderStatistics(filteredUsers);
        })
        .catch(error => {
            console.error("Error occured during API query:", error);
        });
}

document.getElementById("load-more-btn").addEventListener("click", () => {
    loadMoreUsers(10);
});

function renderTeachers(userList) {
    const container = document.getElementById("top-teacher-grid");
    container.innerHTML = "";

    userList.forEach(user => {
        const div = document.createElement("div");
        div.className = "teacher-card";
        div.innerHTML = `
            <div class="teacher-photo-wrapper" onclick="showTeacherDetails(${user.id})">
                <div class="teacher-photo">
                    ${user.picture_large
                ? `<img src="${user.picture_large}" alt="${user.full_name}">`
                : `<div class="initials">${getInitials(user.full_name)}</div>`}
                </div>
                ${user.favorite ? '<span class="filled-star">★</span>' : ''}
            </div>
            <p class="teacher-name">${user.full_name}</p>
            <p class="teacher-subject">${user.course}</p>
            <p class="teacher-country">${user.country}</p>
        `;
        container.appendChild(div);
    });
}

function getInitials(name) {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + "." + parts[1][0] + ".").toUpperCase();
}

window.showTeacherDetails = function (id) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    document.querySelector("#teacher-info-popup img").src = user.picture_large || "";
    document.querySelector(".teacher-info-popup-name").innerText = user.full_name;
    document.querySelector(".teacher-info-popup-details").innerHTML = `
        <div class="teacher-info-popup-top">
            <h1 class="teacher-info-popup-name">${user.full_name}</h1>
            <span class="star ${user.favorite ? 'active' : ''}" onclick="toggleFavorite(${user.id})">
                ${user.favorite ? "★" : "☆"}
            </span>
        </div>
        <p><b>${user.course}</b></p>
        <p>${user.city}, ${user.country}</p>
        <p>${user.age}, ${user.gender}</p>
        <p><a href="mailto:${user.email}">${user.email}</a></p>
        <p>${user.phone}</p>
    `;

    const locationQuery = encodeURIComponent(`${user.city}, ${user.country}`);
    const mapIframe = `
        <iframe 
            id="map-frame"
            src="https://www.google.com/maps?q=${locationQuery}&output=embed"
            width="100%" height="200" style="border:0; margin-top:10px; display:none;"
            allowfullscreen="" loading="lazy">
        </iframe>
    `;

    document.querySelector(".teacher-info-popup-footer").innerHTML = `
        <p>${user.note || "No notes"}</p>
        <a href="#" onclick="toggleMap(event)">toggle map</a>
        ${mapIframe}
    `;

    openPopup("teacher-info-popup");
};

window.toggleMap = function (event) {
    event.preventDefault();
    const iframe = document.getElementById("map-frame");
    if (!iframe) return;

    iframe.style.display = (iframe.style.display === "none") ? "block" : "none";
};

window.toggleFavorite = function (id) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    user.favorite = !user.favorite;
    renderTeachers(filteredUsers);
    renderFavorites(users);
    showTeacherDetails(id);
};

window.renderFavorites = function (userList) {
    const container = document.getElementById("favorites-container");
    const article = container.closest("article");
    container.innerHTML = "";

    const favorites = userList.filter(u => u.favorite);

    if (favorites.length === 0) {
        article.style.display = "none";
        return;
    }

    article.style.display = "block";

    favorites.forEach(user => {
        const div = document.createElement("div");
        div.innerHTML = `
            <div class="teacher-photo" onclick="showTeacherDetails(${user.id})">
                ${user.picture_large
                ? `<img src="${user.picture_large}" alt="${user.full_name}">`
                : `<div class="initials">${getInitials(user.full_name)}</div>`}
            </div>
            <p class="teacher-name">${user.full_name}</p>
            <p class="teacher-country">${user.country}</p>
        `;
        container.appendChild(div);
    });
};

function applyFilters() {
    const ageValue = document.getElementById("age").value;
    const countryValue = document.getElementById("country").value;
    const genderValue = document.getElementById("sex").value.toLowerCase();
    const onlyFavorite = document.getElementById("only-favourite").checked;

    filteredUsers = users.filter(user => {
        let matches = true;

        if (countryValue && user.country !== countryValue) matches = false;
        if (genderValue && genderValue !== "not defined" && user.gender !== genderValue) matches = false;

        if (ageValue) {
            const age = user.age;
            if (ageValue === "18-31" && !(age >= 18 && age <= 31)) matches = false;
            if (ageValue === "32-45" && !(age >= 32 && age <= 45)) matches = false;
            if (ageValue === "45-59" && !(age >= 45 && age <= 59)) matches = false;
            if (ageValue === "60+" && !(age >= 60)) matches = false;
        }

        if (onlyFavorite && !user.favorite) matches = false;

        return matches;
    });

    renderTeachers(filteredUsers);
    renderStatistics(filteredUsers);
}

let currentPage = 1;
const rowsPerPage = 15;
let sortedStatUsers = [...users];

function renderStatistics(userList) {
    const tbody = document.getElementById("stat-table-body");
    tbody.innerHTML = "";

    const startIndex = (currentPage - 1) * rowsPerPage;
    const pageUsers = userList.slice(startIndex, startIndex + rowsPerPage);

    pageUsers.forEach(user => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${user.full_name}</td>
            <td>${user.course || "—"}</td>
            <td>${user.age || "—"}</td>
            <td>${user.gender || "—"}</td>
            <td>${user.country || "—"}</td>
        `;
        tbody.appendChild(tr);
    });

    renderPagination(userList.length);
}

let statSortBy = "full_name";
let statSortOrder = "asc";

function sortUsersBy(users, key, order = 'asc') {
    return [...users].sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (key === "b_day") {
            valA = new Date(valA);
            valB = new Date(valB);
        }

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA == null) return 1;
        if (valB == null) return -1;

        if (valA < valB) return order === "asc" ? -1 : 1;
        if (valA > valB) return order === "asc" ? 1 : -1;
        return 0;
    });
}

document.getElementById("stat-table-header").addEventListener("click", (e) => {
    const th = e.target.closest("th");
    if (!th || !th.dataset.sort) return;

    const sortKey = th.dataset.sort;

    if (statSortBy === sortKey) {
        statSortOrder = statSortOrder === "asc" ? "desc" : "asc";
    } else {
        statSortBy = sortKey;
        statSortOrder = "asc";
    }

    sortedStatUsers = sortUsersBy(filteredUsers, statSortBy, statSortOrder);
    currentPage = 1;
    renderStatistics(sortedStatUsers);
    activateColumn(th, statSortOrder);
});


function activateColumn(thElement, sortOrder) {
    const allHeaders = document.querySelectorAll(".statistic-table th");

    allHeaders.forEach(th => {
        th.classList.remove("active");
        const arrow = th.querySelector(".sort-arrow");
        if (arrow) arrow.textContent = "↑";
    });

    thElement.classList.add("active");
    const arrow = thElement.querySelector(".sort-arrow");
    if (arrow) arrow.textContent = sortOrder === "asc" ? "↓" : "↑";
}

function renderPagination(totalItems) {
    const pageContainer = document.querySelector(".table-page-container");
    pageContainer.innerHTML = "";

    const totalPages = Math.ceil(totalItems / rowsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const span = document.createElement("span");
        span.className = "table-page-number";
        span.textContent = i;
        if (i === currentPage) span.classList.add("active");

        span.addEventListener("click", () => {
            currentPage = i;
            renderStatistics(sortedStatUsers);
        });

        pageContainer.appendChild(span);
    }
}

document.querySelector(".search-btn").addEventListener("click", applySearch);

function applySearch() {
    const query = document.querySelector(".search-field").value.trim().toLowerCase();
    if (!query) {
        filteredUsers = [...users];
        renderTeachers(filteredUsers);
        return;
    }

    filteredUsers = users.filter(user => {
        const nameMatch = user.full_name.toLowerCase().includes(query);
        const noteMatch = user.note && user.note.toLowerCase().includes(query);
        const ageMatch = !isNaN(query) && user.age == Number(query);

        return nameMatch || noteMatch || ageMatch;
    });

    renderTeachers(filteredUsers);
    renderStatistics(filteredUsers);
}

document.querySelector(".search-field").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        applySearch();
    }
});

document.querySelector(".add-teacher-popup-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const full_name = document.getElementById("name").value.trim();
    const course = document.getElementById("speciality").value;
    const country = document.getElementById("new-user-country").value;
    const city = document.getElementById("city").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const b_day = document.getElementById("dob").value;
    const gender = document.querySelector("input[name='gender']:checked")?.id;
    const bg_color = document.getElementById("bg-color").value;
    const note = document.getElementById("notes").value.trim();

    const newUser = {
        full_name,
        course,
        country,
        city,
        email,
        phone,
        b_date: b_day,
        age: calculateAge(b_day),
        gender,
        bg_color: rgbToHex(bg_color),
        note,
        favorite: false,
    };

    // Task 5
    if (!validateUser(newUser)) {
        alert("Some field is filled wrong!");
        return;
    }

    let formattedNewUser = formatRandomUser(newUser, users.length + 1);

    users.push(formattedNewUser);
    filteredUsers = [...users];

    renderTeachers(filteredUsers);
    renderFavorites(users);
    renderStatistics(filteredUsers);
    console.log(users);

    fetch("http://localhost:3001/teachers", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formattedNewUser)
    })
        .then(response => response.json())
        .then(data => {
            console.log("New user inserted in json-server:", data);
        })
        .catch(error => {
            console.error("Error in query to json-server:", error);
        });

    closePopup("add-teacher-popup");
    this.reset();
});

document.getElementById("new-user-country").addEventListener("change", () => {
    const selectedCountry = document.getElementById("new-user-country").value;
    const hintElement = document.getElementById("phone-format-hint");

    if (phoneFormats[selectedCountry]) {
        hintElement.textContent = `Format: ${phoneFormats[selectedCountry]}`;
    } else {
        hintElement.textContent = "";
    }
});


function calculateAge(birthdate) {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

function rgbToHex(rgb) {
    const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
    if (!result) return rgb;
    return "#" + result.slice(1)
        .map(num => parseInt(num).toString(16).padStart(2, '0'))
        .join('');
}

const phoneFormats = {
    'Norway': '12345678',
    'Denmark': '12345678',
    'Germany': '0123-1234567',
    'Ireland': '012-345-6789',
    'Australia': '01-2345-6789',
    'United States': '(123)-456-7890',
    'Finland': '01-234-567',
    'Turkey': '(123)-456-7890',
    'Iran': '123-12345678',
    'Switzerland': '123 456 78 90',
    'Netherlands': '(123)-456-7890',
    'Canada': '123-456-7890',
    'France': '01-23-45-67-89',
    'Spain': '123-456-789',
    'New Zealand': '(123)-456-7890'
};
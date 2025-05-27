import { formatRandomUser, validateUser } from "./lab3.js";

let users = [];
let filteredUsers = [];

document.addEventListener("DOMContentLoaded", () => {
    getRandomUsers();

    document.getElementById("age").addEventListener("change", applyFilters);
    document.getElementById("country").addEventListener("change", applyFilters);
    document.getElementById("sex").addEventListener("change", applyFilters);
    document.getElementById("only-photo").addEventListener("change", applyFilters);
    document.getElementById("only-favorite").addEventListener("change", applyFilters);
});

function getRandomUsers() {
    fetch("https://randomuser.me/api/?results=50")
        .then(response => response.json())
        .then(data => {
            const randomUsers = _.map(data.results, (user, index) => formatRandomUser(user, index + 1));
            users = randomUsers;
            filteredUsers = _.clone(users);

            console.log("Formatted random users: ", randomUsers);

            renderTeachers(filteredUsers);
            renderFavorites(users);
            renderPieChart(filteredUsers);
        })
        .catch(error => console.error("Error occured during API query:", error));
}

function loadMoreUsers(count = 10) {
    fetch(`https://randomuser.me/api/?results=${count}`)
        .then(response => response.json())
        .then(data => {
            const newUsers = _.map(data.results, (user, index) =>
                formatRandomUser(user, users.length + index + 1)
            );

            users.push(...newUsers);
            filteredUsers = _.clone(users);

            renderTeachers(filteredUsers);
            renderFavorites(users);
            renderPieChart(filteredUsers);

            applyFilters();
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

    _.forEach(userList, user => {
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
    const user = _.find(users, { id });
    if (!user) return;

    document.querySelector("#teacher-info-popup img").src = user.picture_large || "";
    document.querySelector(".teacher-info-popup-name").innerText = user.full_name;

    const daysLeft = countUntilBday(user.b_date);

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
        <p>Days until next bday: ${daysLeft} days</p>
        <p><a href="mailto:${user.email}">${user.email}</a></p>
        <p>${user.phone}</p>
    `;

    document.querySelector(".teacher-info-popup-footer").innerHTML = `
        <p>${user.note || "No notes"}</p>
        <div id="map" style="height: 250px; margin-top: 10px;"></div>
    `;

    openPopup("teacher-info-popup");

    toggleMap(user);
};

// Task 1

window.toggleMap = function (user) {
    const { latitude, longitude } = user.coordinates || {};
    if (latitude && longitude) {
        if (window.teacherMap) {
            window.teacherMap.remove();
        }

        window.teacherMap = L.map('map').setView([parseFloat(latitude), parseFloat(longitude)], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(window.teacherMap);

        L.marker([parseFloat(latitude), parseFloat(longitude)]).addTo(window.teacherMap)
            .bindPopup(user.full_name)
            .openPopup();

        setTimeout(() => {
            window.teacherMap.invalidateSize();
        }, 500);
    } else {
        const mapDiv = document.getElementById('map');
        mapDiv.innerHTML = '<p>No coordinates available</p>';
        mapDiv.style.height = 'auto';
        mapDiv.style.marginTop = '0px';
    }
};

// Task 4

function countUntilBday(b_date) {
    const birthDate = dayjs(b_date);
    const today = dayjs();
    let nextBirthday = birthDate.year(today.year());

    if (nextBirthday.isBefore(today, 'day')) {
        nextBirthday = nextBirthday.add(1, 'year');
    }

    return nextBirthday.diff(today, 'day');
}

window.toggleFavorite = function (id) {
    const user = _.find(users, { id });
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

    const favorites = _.filter(userList, { 'favorite': true });

    if (favorites.length === 0) {
        article.style.display = "none";
        return;
    }

    article.style.display = "block";

    _.forEach(favorites, user => {
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
    const onlyPhoto = document.getElementById("only-photo").checked;
    const onlyFavorite = document.getElementById("only-favorite").checked;

    filteredUsers = _.filter(users, function (user) {
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

        if (onlyPhoto && !user.picture_large) matches = false;

        return matches;
    });

    renderTeachers(filteredUsers);
    renderPieChart(filteredUsers);
}

document.querySelector(".search-btn").addEventListener("click", applySearch);

function applySearch() {
    const query = document.querySelector(".search-field").value.trim().toLowerCase();
    if (!query) {
        filteredUsers = _.clone(users);
        renderTeachers(filteredUsers);
        return;
    }

    filteredUsers = _.filter(users, function (user) {
        const nameMatch = user.full_name.toLowerCase().includes(query);
        const noteMatch = user.note && user.note.toLowerCase().includes(query);
        const ageMatch = !isNaN(query) && user.age == Number(query);

        return nameMatch || noteMatch || ageMatch;
    });

    renderTeachers(filteredUsers);
    renderPieChart(filteredUsers);
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

    if (!validateUser(newUser)) {
        alert("Some field is filled wrong!");
        return;
    }

    let formattedNewUser = formatRandomUser(newUser, users.length + 1);

    users.push(formattedNewUser);
    filteredUsers = _.clone(users);
    applyFilters();

    renderTeachers(filteredUsers);
    renderFavorites(users);
    renderPieChart(filteredUsers);
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

// Task 2

let chartInstance = null;

function renderPieChart(userList) {
    const article = document.getElementById("pieChart").closest("article");

    if (filteredUsers.length === 0) {
        article.style.display = "none";
        return;
    }

    article.style.display = "block";

    const countryCounts = {};

    _.forEach(userList, function (user) {
        if (!user.country) return;
        countryCounts[user.country] = (countryCounts[user.country] || 0) + 1;
    });

    const sortedCountries = _.sortBy(
        Object.entries(countryCounts),
        ([country, count]) => -count
    );

    const labels = sortedCountries.map(([country]) => country);
    const data = sortedCountries.map(([, count]) => count);

    const ctx = document.getElementById("pieChart").getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                label: "Teachers from this country",
                data,
                backgroundColor: generateColors(labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        boxWidth: 12
                    }
                },
                title: {
                    display: true,
                    text: "Top Countries"
                }
            }
        }
    });
}

function generateColors(count) {
    const colors = [];
    const hueStep = 360 / count;

    for (let i = 0; i < count; i++) {
        const hue = i * hueStep;
        colors.push(`hsl(${hue}, 70%, 60%)`);
    }

    return colors;
}
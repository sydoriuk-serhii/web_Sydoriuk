
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
    b_date: string;
    age: number;
    phone: string;
    picture_large: string;
    picture_thumbnail: string;
    id: string;
    favorite: boolean;
    course: string;
    bg_color: string;
    note: string | null;
}

const courses = [
    "Mathematics", "Physics", "English", "Computer Science", "Dancing",
    "Chess", "Biology", "Chemistry", "Law", "Art", "Medicine", "Statistics"
];

const ITEMS_PER_PAGE = 10;

const getRandomCourse = (): string => courses[Math.floor(Math.random() * courses.length)];

const normalizeUser = (user: any): User => ({
    gender: user.gender || "-",
    title: user.name?.title || "-",
    full_name: `${user.name?.first || "-"} ${user.name?.last || "-"}`,
    city: user.location?.city || "-",
    state: user.location?.state || "-",
    country: user.location?.country || "-",
    postcode: user.location?.postcode?.toString() || "-",
    coordinates: user.location?.coordinates || { latitude: "-", longitude: "-" },
    timezone: user.location?.timezone || { offset: "-", description: "-" },
    email: user.email || "-",
    b_date: user.dob?.date || "-",
    age: user.dob?.age || 0,
    phone: user.phone || "-",
    picture_large: user.picture?.large || "-",
    picture_thumbnail: user.picture?.thumbnail || "-",
    id: user.login?.uuid || Math.random().toString(36).substring(2, 9),
    favorite: false,
    course: getRandomCourse(),
    bg_color: "#fffff",
    note: null
});

const fetchUsers = async (): Promise<User[]> => {
    try {
        const localResponse = await fetch('http://localhost:3001/teachers');
        const localData = await localResponse.json();

        if (localData.length > 0) {
            return localData;
        }

        const response = await fetch('https://randomuser.me/api/?results=50');
        const data = await response.json();
        return data.results?.map((user: any) => normalizeUser(user)) || [];
        
    
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

let users: User[] = [];
let filteredUsers: User[] = [];
let currentPage = 1;

const container = document.getElementById("users-container");
const filtersSection = document.querySelector(".filters");
const favoritesContainer = document.getElementById("favorites-list");
const paginationContainer = document.querySelector(".pagination");
const tablePaginationContainer = document.querySelector(".table-pagination");
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

const addTeacherButton = document.createElement("button");
addTeacherButton.textContent = "Add Teacher";
addTeacherButton.className = "button-add";
addTeacherButton.id = "addTeacherBtn";

if (filtersSection) {
    filtersSection.appendChild(filterButton);
    filtersSection.appendChild(resetButton);
}

const initModals = () => {
    document.querySelector(".close")?.addEventListener("click", () => {
        teacherModal.style.display = "none";
    });

    const addTeacherClose = document.querySelector(".pop-add-header .close");
    addTeacherClose?.addEventListener("click", () => {
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

const toggleFavorite = async (userId: string): Promise<void> => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

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
    } catch (error) {
        console.error('Error updating favorite status:', error);
        user.favorite = !user.favorite;
    }
};

const updateAllViews = (): void => {
    const usersToRender = filteredUsers.length > 0 ? filteredUsers : users;
    renderUsers(usersToRender);
    renderStatisticsTable(usersToRender);
    renderFavorites();
    renderPagination(usersToRender, paginationContainer, 'cards');
    renderPagination(usersToRender, tablePaginationContainer, 'table');
};

const renderFavorites = (): void => {
    if (!favoritesContainer) return;
    
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
            if (userId) toggleFavorite(userId);
        });
    });
};

const filterUsers = (): void => {
    const ageFilter = (document.getElementById("age") as HTMLSelectElement).value;
    const regionFilter = (document.getElementById("region") as HTMLSelectElement).value;
    const sexFilter = (document.getElementById("sex") as HTMLSelectElement).value;
    const onlyWithPhoto = (document.getElementById("onlyWithPhoto") as HTMLInputElement).checked;
    const onlyFavorites = (document.getElementById("onlyFavorites") as HTMLInputElement).checked;

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
        const regions: Record<string, string[]> = {
            "Europe": ["France", "Germany", "Spain", "Ukraine", "Italy"],
            "Asia": ["China", "Japan", "India", "Thailand", "South Korea"],
            "North America": ["USA", "Canada", "Mexico"]
        };

        if (regionFilter === "Other") {
            const allRegions = Object.keys(regions).reduce((acc, key) => [...acc, ...regions[key]], [] as string[]);
            filteredUsers = filteredUsers.filter(user => !allRegions.includes(user.country));
        } else {
            filteredUsers = filteredUsers.filter(user => 
                regions[regionFilter]?.includes(user.country) ?? false
            );
        }
    }

    if (sexFilter !== "All") {
        filteredUsers = filteredUsers.filter(user => 
            user.gender.toLowerCase() === sexFilter.toLowerCase()
        );
    }

    currentPage = 1;
    updateAllViews();
};

const resetFilters = (): void => {
    (document.getElementById("age") as HTMLSelectElement).value = "All";
    (document.getElementById("region") as HTMLSelectElement).value = "All";
    (document.getElementById("sex") as HTMLSelectElement).value = "All";
    (document.getElementById("onlyWithPhoto") as HTMLInputElement).checked = false;
    (document.getElementById("onlyFavorites") as HTMLInputElement).checked = false;
    
    filteredUsers = [];
    currentPage = 1;
    updateAllViews();
};

const setupFilters = (): void => {
    filterButton.addEventListener("click", filterUsers);
    resetButton.addEventListener("click", resetFilters);
    
    const filterElements = ["age", "region", "sex", "onlyWithPhoto", "onlyFavorites"];
    filterElements.forEach(id => {
        document.getElementById(id)?.addEventListener("change", filterUsers);
    });
};

const getPaginatedData = (data: User[], page: number): User[] => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
};

const renderPagination = (data: User[], container: Element | null, type: string): void => {
    if (!container) return;
    
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    container.innerHTML = '';
    
    if (totalPages <= 1) return;

    const createButton = (content: string, handler: () => void, disabled = false) => {
        const button = document.createElement('span');
        button.textContent = content;
        button.className = `page-button ${disabled ? 'disabled' : ''}`;
        if (!disabled) button.addEventListener('click', handler);
        return button;
    };

    container.appendChild(
        createButton('«', () => { currentPage--; updateAllViews(); }, currentPage === 1)
    );

    for (let i = 1; i <= totalPages; i++) {
        const button = createButton(i.toString(), () => { 
            currentPage = i; 
            updateAllViews(); 
        });
        button.className += i === currentPage ? ' active' : '';
        container.appendChild(button);
    }

    container.appendChild(
        createButton('»', () => { currentPage++; updateAllViews(); }, currentPage === totalPages)
    );
};

const renderUsers = (usersToRender: User[] = users): void => {
    if (!container) return;
    
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
            if (userId) toggleFavorite(userId);
        });
    });
};

const renderStatisticsTable = (usersToRender: User[] = users): void => {
    const tableBody = document.querySelector('#teachers-table tbody');
    if (!tableBody) return;

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

const setupTableSorting = (): void => {
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

const openModal = (user: User): void => {
    if (!teacherModal) return;

    const modalImage = document.getElementById("modalImage") as HTMLImageElement;
    const modalName = document.getElementById("modalName") as HTMLElement;
    const modalSubject = document.getElementById("modalSubject") as HTMLElement;
    const modalCountry = document.getElementById("modalCountry") as HTMLElement;
    const modalAge = document.getElementById("modalAge") as HTMLElement;
    const modalEmail = document.getElementById("modalEmail") as HTMLElement;
    const modalNumber = document.getElementById("modalNumber") as HTMLElement;
    const modalFavoriteButton = document.getElementById("modalFavoriteButton") as HTMLButtonElement;

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

const addNewTeacher = async (): Promise<void> => {
    const nameInput = document.getElementById("name") as HTMLInputElement;
    const specialityInput = document.getElementById("speciality") as HTMLInputElement;
    const countryInput = document.getElementById("country") as HTMLInputElement;
    const cityInput = document.getElementById("city") as HTMLInputElement;
    const phoneInput = document.getElementById("phone") as HTMLInputElement;
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const dobInput = document.getElementById("dob") as HTMLInputElement;
    const sexInput = document.querySelector('input[name="sex"]:checked') as HTMLInputElement;
    const bgColorInput = document.getElementById("bg-color") as HTMLInputElement;
    const notesInput = document.getElementById("notes") as HTMLTextAreaElement;

    if (!nameInput.value || !specialityInput.value || !countryInput.value || 
        !cityInput.value || !phoneInput.value || !emailInput.value || 
        !dobInput.value || !sexInput) {
        alert("Please fill in all required fields");
        return;
    }

    const newTeacher: User = {
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
    } catch (error) {
        console.error('Error adding teacher:', error);
        alert('Error adding teacher. Please try again.');
    }
};

const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }
    
    return age;
};

const resetAddTeacherForm = (): void => {
    const form = document.querySelector(".pop-add-body form") as HTMLFormElement;
    if (form) {
        form.reset();
    }
};

const setupAddTeacherForm = (): void => {
    const addButton = document.querySelector(".pop-add-footer .add-button");
    addButton?.addEventListener("click", (e) => {
        e.preventDefault();
        addNewTeacher();
    });
};

const initApp = async (): Promise<void> => {
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
    
    scrollLeft?.addEventListener('click', () => {
        favoritesContainer?.scrollBy({ left: -200, behavior: 'smooth' });
    });
    
    scrollRight?.addEventListener('click', () => {
        favoritesContainer?.scrollBy({ left: 200, behavior: 'smooth' });
    });
};

window.addEventListener('DOMContentLoaded', initApp);
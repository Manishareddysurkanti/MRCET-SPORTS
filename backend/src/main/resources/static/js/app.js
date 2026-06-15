// ================= STATE MANAGEMENT =================
const App = {
    currentView: 'dashboard',
    user: {
        id: null,
        name: '',
        email: '',
        role: ''
    },
    notifications: []
};

function autofillDemo(email) {
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = 'password123';
    switchAuthTab('login');
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Set default theme from storage
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }

    checkAuth();
});

function checkAuth() {
    const token = API.getToken();
    if (!token) {
        document.getElementById('auth-container').classList.remove('d-none');
        document.getElementById('dashboard-container').classList.add('d-none');
    } else {
        App.user.id = parseInt(localStorage.getItem('user_id'));
        App.user.name = localStorage.getItem('user_name');
        App.user.email = localStorage.getItem('user_email');
        App.user.role = localStorage.getItem('user_role');

        document.getElementById('auth-container').classList.add('d-none');
        document.getElementById('dashboard-container').classList.remove('d-none');
        
        document.getElementById('sidebar-user-name').innerText = App.user.name;
        document.getElementById('sidebar-user-role').innerText = App.user.role;

        buildSidebar();
        loadNotifications();
        switchView('dashboard');
    }
}

// ================= AUTHENTICATION HANDLERS =================
function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const tabs = document.querySelectorAll('#auth-tabs .nav-link');

    if (tab === 'login') {
        loginForm.classList.remove('d-none');
        regForm.classList.add('d-none');
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        loginForm.classList.add('d-none');
        regForm.classList.remove('d-none');
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
        toggleRegFields();
    }
}

function toggleRegFields() {
    const role = document.getElementById('reg-role').value;
    const studentFields = document.getElementById('student-fields');
    const coachFields = document.getElementById('coach-fields');

    if (role === 'STUDENT') {
        studentFields.classList.remove('d-none');
        coachFields.classList.add('d-none');
    } else {
        studentFields.classList.add('d-none');
        coachFields.classList.remove('d-none');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await API.login(email, password);
        checkAuth();
    } catch (e) {
        alert(e.message);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;
    const contact = document.getElementById('reg-contact').value;

    try {
        if (role === 'STUDENT') {
            const rollNo = document.getElementById('reg-roll').value;
            const dept = document.getElementById('reg-dept').value;
            const year = document.getElementById('reg-year').value;
            await API.registerStudent(name, email, password, rollNo, dept, year, contact);
        } else {
            const sportId = document.getElementById('reg-sport-id').value;
            const experience = document.getElementById('reg-exp').value;
            await API.registerCoach(name, email, password, sportId, experience, contact);
        }
        alert('Registration successful! Please login.');
        switchAuthTab('login');
    } catch (e) {
        alert(e.message);
    }
}

function handleLogout() {
    API.logout();
}

// ================= SIDEBAR & THEME TOGGLES =================
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('show');
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    const themeIcon = document.querySelector('#theme-toggle i');
    themeIcon.className = newTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    
    // Redraw charts with dark grid configurations if needed
    if (App.currentView === 'dashboard') {
        renderDashboard();
    }
}

function buildSidebar() {
    const list = document.getElementById('nav-list');
    list.innerHTML = '';

    const role = App.user.role;
    let items = [];

    if (role === 'ADMIN') {
        items = [
            { view: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
            { view: 'admin-sports', label: 'Sports & Teams', icon: 'fa-basketball' },
            { view: 'admin-tournaments', label: 'Tournaments', icon: 'fa-trophy' },
            { view: 'admin-facilities', label: 'Ground Bookings', icon: 'fa-calendar-check' },
            { view: 'admin-reports', label: 'Reports & Analytics', icon: 'fa-file-excel' }
        ];
    } else if (role === 'STUDENT') {
        items = [
            { view: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
            { view: 'student-profile', label: 'My Profile', icon: 'fa-user' },
            { view: 'student-teams', label: 'Join a Team', icon: 'fa-users' },
            { view: 'student-bookings', label: 'Ground Bookings', icon: 'fa-calendar-alt' },
            { view: 'student-performance', label: 'My Performance', icon: 'fa-chart-line' }
        ];
    } else if (role === 'COACH') {
        items = [
            { view: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
            { view: 'coach-profile', label: 'My Profile', icon: 'fa-user' },
            { view: 'coach-attendance', label: 'Record Attendance', icon: 'fa-clipboard-user' },
            { view: 'coach-performance', label: 'Performance Log', icon: 'fa-square-poll-vertical' },
            { view: 'coach-analytics', label: 'Team Analytics', icon: 'fa-chart-simple' }
        ];
    }

    items.forEach(item => {
        const li = document.createElement('li');
        li.setAttribute('id', `nav-${item.view}`);
        if (item.view === App.currentView) li.classList.add('active');

        li.innerHTML = `
            <a href="#" onclick="switchView('${item.view}')">
                <i class="fa-solid ${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `;
        list.appendChild(li);
    });
}

function switchView(viewName) {
    App.currentView = viewName;
    
    // Update active nav class
    document.querySelectorAll('#nav-list li').forEach(li => li.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${viewName}`);
    if (activeNav) activeNav.classList.add('active');

    // Close mobile sidebar if open
    document.getElementById('sidebar').classList.remove('show');

    // Render corresponding view
    if (viewName === 'dashboard') {
        renderDashboard();
    } else if (viewName === 'admin-sports') {
        renderAdminSports();
    } else if (viewName === 'admin-tournaments') {
        renderAdminTournaments();
    } else if (viewName === 'admin-facilities') {
        renderAdminFacilities();
    } else if (viewName === 'admin-reports') {
        renderAdminReports();
    } else if (viewName === 'student-profile') {
        renderStudentProfile();
    } else if (viewName === 'student-teams') {
        renderStudentTeams();
    } else if (viewName === 'student-bookings') {
        renderStudentBookings();
    } else if (viewName === 'student-performance') {
        renderStudentPerformance();
    } else if (viewName === 'coach-profile') {
        renderCoachProfile();
    } else if (viewName === 'coach-attendance') {
        renderCoachAttendance();
    } else if (viewName === 'coach-performance') {
        renderCoachPerformance();
    } else if (viewName === 'coach-analytics') {
        renderCoachAnalytics();
    }
}

// ================= NOTIFICATION POLLING =================
async function loadNotifications() {
    try {
        const data = await API.getNotifications(App.user.id);
        App.notifications = data;

        const unreadCount = data.filter(n => !n.isRead).length;
        const badge = document.getElementById('notif-badge');
        if (unreadCount > 0) {
            badge.innerText = unreadCount;
            badge.classList.remove('d-none');
        } else {
            badge.classList.add('d-none');
        }

        const dropdownContainer = document.getElementById('notif-list-container');
        dropdownContainer.innerHTML = '';

        if (data.length === 0) {
            dropdownContainer.innerHTML = '<li class="text-center p-3 text-muted">No notifications</li>';
            return;
        }

        data.slice(0, 5).forEach(n => {
            const li = document.createElement('li');
            li.className = `notif-item ${n.isRead ? 'text-muted' : ''}`;
            li.style.cursor = n.isRead ? 'default' : 'pointer';
            li.onclick = n.isRead ? null : async () => {
                await API.markNotificationRead(n.id);
                loadNotifications();
            };
            li.innerHTML = `
                <div class="title">${n.title}</div>
                <div class="msg">${n.message}</div>
            `;
            dropdownContainer.appendChild(li);
        });
    } catch (e) {
        console.error("Failed to load notifications", e);
    }
}

// ================= RENDER FUNCTIONS =================

// 1. DASHBOARD VIEW
async function renderDashboard() {
    const wrapper = document.getElementById('view-wrapper');
    wrapper.innerHTML = `<div class="text-center p-5"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;

    if (App.user.role === 'ADMIN') {
        try {
            const stats = await API.getStats();
            wrapper.innerHTML = `
                <h3 class="mb-4">Admin Dashboard</h3>
                <div class="row g-4 mb-4">
                    <div class="col-md-3">
                        <div class="metric-card">
                            <div>
                                <h2 class="fw-bold">${stats.totalStudents}</h2>
                                <span class="text-muted">Total Students</span>
                            </div>
                            <div class="icon-box bg-primary"><i class="fa-solid fa-graduation-cap"></i></div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="metric-card">
                            <div>
                                <h2 class="fw-bold">${stats.totalCoaches}</h2>
                                <span class="text-muted">Total Coaches</span>
                            </div>
                            <div class="icon-box bg-success"><i class="fa-solid fa-user-tie"></i></div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="metric-card">
                            <div>
                                <h2 class="fw-bold">${stats.activeTournaments}</h2>
                                <span class="text-muted">Active Tournaments</span>
                            </div>
                            <div class="icon-box bg-warning"><i class="fa-solid fa-trophy"></i></div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="metric-card">
                            <div>
                                <h2 class="fw-bold">${stats.pendingBookings}</h2>
                                <span class="text-muted">Pending Bookings</span>
                            </div>
                            <div class="icon-box bg-danger"><i class="fa-solid fa-calendar-check"></i></div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-8">
                        <div class="custom-card" style="height: 350px;">
                            <h5><i class="fa-solid fa-chart-line text-primary"></i> Sports Facility Analytics</h5>
                            <canvas id="admin-chart"></canvas>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="custom-card" style="height: 350px;">
                            <h5><i class="fa-solid fa-chart-pie text-success"></i> Category Distribution</h5>
                            <canvas id="category-chart"></canvas>
                        </div>
                    </div>
                </div>
            `;

            // Render sample analytical graphs
            setTimeout(() => {
                CHARTS.renderLineChart('admin-chart', 'Active Bookings', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [4, 6, 9, 3, 11, 14, 8]);
                CHARTS.renderDoughnutChart('category-chart', ['Cricket', 'Basketball', 'Football'], [3, 2, 4]);
            }, 50);

        } catch (e) {
            wrapper.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
        }
    } else if (App.user.role === 'STUDENT') {
        try {
            const records = await API.getPerformance(App.user.id);
            const recommendations = await API.getTrainingRecommendations(App.user.id);
            
            let recentScore = "N/A";
            let trendHtml = "No matches played yet.";
            
            if (records.length > 0) {
                recentScore = records[records.length - 1].performanceScore;
                trendHtml = `<div style="height: 180px;"><canvas id="student-trend-chart"></canvas></div>`;
            }

            wrapper.innerHTML = `
                <h3 class="mb-4">Welcome back, ${App.user.name}!</h3>
                <div class="row g-4 mb-4">
                    <div class="col-md-4">
                        <div class="metric-card">
                            <div>
                                <h2 class="fw-bold">${recentScore}</h2>
                                <span class="text-muted">Last Match Score</span>
                            </div>
                            <div class="icon-box bg-primary"><i class="fa-solid fa-award"></i></div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="metric-card">
                            <div>
                                <h2 class="fw-bold">${App.notifications.length}</h2>
                                <span class="text-muted">Notifications</span>
                            </div>
                            <div class="icon-box bg-success"><i class="fa-solid fa-bell"></i></div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="metric-card">
                            <div>
                                <h2 class="fw-bold">${recommendations.weeklySchedule.length}</h2>
                                <span class="text-muted">Weekly Exercises</span>
                            </div>
                            <div class="icon-box bg-warning"><i class="fa-solid fa-dumbbell"></i></div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="custom-card">
                            <h5><i class="fa-solid fa-brain text-info"></i> AI Training Recommendation</h5>
                            <p class="text-muted mb-2"><strong>Sport:</strong> ${recommendations.sport} | <strong>Focus Area:</strong> ${recommendations.identifiedWeakness}</p>
                            <h6 class="fw-semibold mt-3">Weekly Schedule:</h6>
                            <ul class="list-group mb-3">
                                ${recommendations.weeklySchedule.map(s => `<li class="list-group-item bg-transparent text-primary-emphasis">${s}</li>`).join('')}
                            </ul>
                            <h6 class="fw-semibold">Recommended Drills:</h6>
                            <ul class="list-group">
                                ${recommendations.recommendedExercises.map(e => `<li class="list-group-item bg-transparent text-primary-emphasis"><i class="fa-solid fa-square-check text-success me-2"></i>${e}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="custom-card">
                            <h5><i class="fa-solid fa-chart-line text-primary"></i> Performance Trend</h5>
                            ${trendHtml}
                        </div>
                    </div>
                </div>
            `;

            if (records.length > 0) {
                setTimeout(() => {
                    const labels = records.map(r => r.recordedDate);
                    const scores = records.map(r => r.performanceScore);
                    CHARTS.renderLineChart('student-trend-chart', 'Rating', labels, scores, '#3b82f6');
                }, 50);
            }

        } catch (e) {
            wrapper.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
        }
    } else if (App.user.role === 'COACH') {
        try {
            const teams = await API.getCoachTeams(App.user.id);
            wrapper.innerHTML = `
                <h3 class="mb-4">Coach Control Center</h3>
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="metric-card">
                            <div>
                                <h2 class="fw-bold">${teams.length}</h2>
                                <span class="text-muted">Teams Coached</span>
                            </div>
                            <div class="icon-box bg-success"><i class="fa-solid fa-users"></i></div>
                        </div>
                    </div>
                </div>

                <div class="custom-card">
                    <h5><i class="fa-solid fa-shield-halved text-primary"></i> Coached Rosters</h5>
                    <div class="table-responsive">
                        <table class="table table-hover table-custom align-middle">
                            <thead>
                                <tr>
                                    <th>Team Name</th>
                                    <th>Sport</th>
                                    <th>Captain</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${teams.map(t => `
                                    <tr>
                                        <td><strong>${t.name}</strong></td>
                                        <td>${t.sport.name}</td>
                                        <td>${t.captain.name}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary" onclick="switchView('coach-analytics')">View Analytics</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (e) {
            wrapper.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
        }
    }
}

// 2. ADMIN: SPORTS & TEAMS
async function renderAdminSports() {
    const wrapper = document.getElementById('view-wrapper');
    wrapper.innerHTML = `<div class="text-center p-5"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;

    try {
        const sports = await API.getSports();
        wrapper.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>Manage Sports Categories</h3>
                <button class="btn btn-primary" onclick="showAddSportModal()"><i class="fa-solid fa-plus me-2"></i>Add Category</button>
            </div>
            
            <div class="row g-4 mb-5">
                ${sports.map(s => `
                    <div class="col-md-4">
                        <div class="custom-card h-100 d-flex flex-column justify-content-between">
                            <div>
                                <h5 class="text-primary"><i class="fa-solid fa-award"></i> ${s.name}</h5>
                                <span class="badge bg-secondary mb-3">${s.type}</span>
                                <p class="text-muted small">${s.description}</p>
                                <p class="text-muted small"><strong>Rules:</strong> ${s.rules}</p>
                            </div>
                            <div class="text-end border-top pt-3">
                                <button class="btn btn-sm btn-outline-danger" onclick="handleDeleteSport(${s.id})"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Create Sport Modal -->
            <div class="modal fade" id="addSportModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content bg-secondary text-primary-emphasis">
                        <div class="modal-header border-bottom-0">
                            <h5 class="modal-title">Add Sport Category</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form onsubmit="handleCreateSport(event)">
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label class="form-label">Sport Name</label>
                                    <input type="text" class="form-control" id="sport-name" required placeholder="Tennis">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Type</label>
                                    <select class="form-select" id="sport-type">
                                        <option value="TEAM">Team</option>
                                        <option value="INDIVIDUAL">Individual</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" id="sport-desc" rows="3" placeholder="Description..."></textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Rules</label>
                                    <textarea class="form-control" id="sport-rules" rows="3" placeholder="Rules..."></textarea>
                                </div>
                            </div>
                            <div class="modal-footer border-top-0">
                                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="submit" class="btn btn-primary">Save Sport</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        wrapper.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
    }
}

let addSportModalInstance;
function showAddSportModal() {
    addSportModalInstance = new bootstrap.Modal(document.getElementById('addSportModal'));
    addSportModalInstance.show();
}

async function handleCreateSport(e) {
    e.preventDefault();
    const name = document.getElementById('sport-name').value;
    const type = document.getElementById('sport-type').value;
    const description = document.getElementById('sport-desc').value;
    const rules = document.getElementById('sport-rules').value;

    try {
        await API.saveSport({ name, type, description, rules });
        addSportModalInstance.hide();
        renderAdminSports();
    } catch (e) {
        alert(e.message);
    }
}

async function handleDeleteSport(id) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
        await API.deleteSport(id);
        renderAdminSports();
    } catch (e) {
        alert(e.message);
    }
}

// 3. ADMIN: TOURNAMENTS
async function renderAdminTournaments() {
    const wrapper = document.getElementById('view-wrapper');
    wrapper.innerHTML = `<div class="text-center p-5"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;

    try {
        const list = await API.getTournaments();
        wrapper.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>Tournaments Center</h3>
                <button class="btn btn-primary" onclick="showAddTournamentModal()"><i class="fa-solid fa-plus me-2"></i>Create Tournament</button>
            </div>

            <div class="custom-card">
                <div class="table-responsive">
                    <table class="table table-hover table-custom align-middle">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Sport</th>
                                <th>Timeline</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${list.map(t => `
                                <tr>
                                    <td><strong>${t.name}</strong></td>
                                    <td>${t.sport.name}</td>
                                    <td>${t.startDate} to ${t.endDate}</td>
                                    <td>${t.type}</td>
                                    <td><span class="badge ${t.status === 'Completed' ? 'bg-success' : t.status === 'Active' ? 'bg-warning' : 'bg-primary'}">${t.status}</span></td>
                                    <td>
                                        ${t.status === 'Upcoming' ? `<button class="btn btn-sm btn-outline-success me-2" onclick="handleGenerateFixtures(${t.id})">Generate Fixtures</button>` : ''}
                                        <button class="btn btn-sm btn-outline-info" onclick="showPointsTable(${t.id})">Points Table</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Points Table Modal -->
            <div class="modal fade" id="pointsTableModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content bg-secondary text-primary-emphasis">
                        <div class="modal-header border-bottom-0">
                            <h5 class="modal-title">Tournament Standings</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="points-table-body">
                            <!-- Injected standings table -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Create Tournament Modal -->
            <div class="modal fade" id="addTournamentModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content bg-secondary text-primary-emphasis">
                        <div class="modal-header border-bottom-0">
                            <h5 class="modal-title">Create Tournament</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form onsubmit="handleCreateTournament(event)">
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label class="form-label">Tournament Name</label>
                                    <input type="text" class="form-control" id="tour-name" required placeholder="Summer League 2026">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Sport Category</label>
                                    <select class="form-select" id="tour-sport-id">
                                        <option value="1">Cricket</option>
                                        <option value="2">Basketball</option>
                                        <option value="3">Football</option>
                                    </select>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Start Date</label>
                                        <input type="date" class="form-control" id="tour-start" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">End Date</label>
                                        <input type="date" class="form-control" id="tour-end" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Type</label>
                                    <select class="form-select" id="tour-type">
                                        <option value="ROUND_ROBIN">Round Robin</option>
                                        <option value="KNOCKOUT">Knockout</option>
                                    </select>
                                </div>
                            </div>
                            <div class="modal-footer border-top-0">
                                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="submit" class="btn btn-primary">Save Tournament</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        wrapper.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
    }
}

let addTournamentModalInstance;
function showAddTournamentModal() {
    addTournamentModalInstance = new bootstrap.Modal(document.getElementById('addTournamentModal'));
    addTournamentModalInstance.show();
}

async function handleCreateTournament(e) {
    e.preventDefault();
    const name = document.getElementById('tour-name').value;
    const sportId = parseInt(document.getElementById('tour-sport-id').value);
    const startDate = document.getElementById('tour-start').value;
    const endDate = document.getElementById('tour-end').value;
    const type = document.getElementById('tour-type').value;

    const sport = { id: sportId };

    try {
        await API.createTournament({ name, sport, startDate, endDate, type });
        addTournamentModalInstance.hide();
        renderAdminTournaments();
    } catch (e) {
        alert(e.message);
    }
}

async function handleGenerateFixtures(tournamentId) {
    if (!confirm('This will delete previous matches and schedule round-robin fixtures. Proceed?')) return;
    try {
        await API.generateFixtures(tournamentId);
        alert('Match fixtures generated successfully!');
        renderAdminTournaments();
    } catch (e) {
        alert(e.message);
    }
}

async function showPointsTable(tournamentId) {
    const tableBody = document.getElementById('points-table-body');
    tableBody.innerHTML = `<div class="text-center p-4"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;
    
    const pointsModal = new bootstrap.Modal(document.getElementById('pointsTableModal'));
    pointsModal.show();

    try {
        const standings = await API.getPointsTable(tournamentId);
        
        if (standings.length === 0) {
            tableBody.innerHTML = `<div class="alert alert-info">No team standings available yet. Generate matches first.</div>`;
            return;
        }

        tableBody.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped table-hover align-middle text-primary-emphasis">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Team Name</th>
                            <th>Matches Played</th>
                            <th>Won</th>
                            <th>Lost</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${standings.map((s, index) => `
                            <tr>
                                <td><strong>${index + 1}</strong></td>
                                <td><strong>${s.teamName}</strong></td>
                                <td>${s.played}</td>
                                <td>${s.won}</td>
                                <td>${s.lost}</td>
                                <td><span class="badge bg-success">${s.points}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (e) {
        tableBody.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
    }
}

// 4. ADMIN: FACILITIES & BOOKINGS
async function renderAdminFacilities() {
    const wrapper = document.getElementById('view-wrapper');
    wrapper.innerHTML = `<div class="text-center p-5"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;

    try {
        const bookings = await API.getAllBookings();
        const equipment = await API.getEquipment();

        wrapper.innerHTML = `
            <h3 class="mb-4">Facility Booking approvals & Inventory</h3>
            
            <div class="row g-4">
                <div class="col-md-8">
                    <div class="custom-card">
                        <h5 class="mb-4"><i class="fa-solid fa-clock-rotate-left text-warning"></i> Reservation Requests Queue</h5>
                        <div class="table-responsive">
                            <table class="table table-hover table-custom align-middle">
                                <thead>
                                    <tr>
                                        <th>Ground</th>
                                        <th>Requested By</th>
                                        <th>Date</th>
                                        <th>Time Slot</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${bookings.map(b => `
                                        <tr>
                                            <td><strong>${b.ground.name}</strong></td>
                                            <td>${b.user.name}</td>
                                            <td>${b.bookingDate}</td>
                                            <td>${b.startTime} - ${b.endTime}</td>
                                            <td><span class="badge ${b.status === 'Approved' ? 'bg-success' : b.status === 'Rejected' ? 'bg-danger' : 'bg-warning'}">${b.status}</span></td>
                                            <td>
                                                ${b.status === 'Pending' ? `
                                                    <button class="btn btn-sm btn-success me-1" onclick="handleApproveBooking(${b.id})"><i class="fa-solid fa-check"></i></button>
                                                    <button class="btn btn-sm btn-danger" onclick="handleRejectBooking(${b.id})"><i class="fa-solid fa-xmark"></i></button>
                                                ` : 'Processed'}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="custom-card">
                        <h5 class="mb-4"><i class="fa-solid fa-boxes-stacked text-primary"></i> Equipment Inventory</h5>
                        <div class="list-group">
                            ${equipment.map(e => `
                                <div class="list-group-item bg-transparent text-primary-emphasis border-0 px-0 pb-3 mb-3 border-bottom">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <strong>${e.name}</strong>
                                        <span class="badge bg-secondary">${e.sport.name}</span>
                                    </div>
                                    <div class="d-flex justify-content-between text-muted small">
                                        <span>Available: <strong>${e.availableQty}</strong> / ${e.totalQty}</span>
                                        <a href="#" class="text-primary" onclick="showAdjustStockModal(${e.id}, ${e.totalQty}, ${e.availableQty})">Adjust Stock</a>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Adjust Stock Modal -->
            <div class="modal fade" id="adjustStockModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content bg-secondary text-primary-emphasis">
                        <div class="modal-header border-bottom-0">
                            <h5 class="modal-title">Adjust Equipment Inventory</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form onsubmit="handleAdjustStock(event)">
                            <input type="hidden" id="stock-eq-id">
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label class="form-label">Total Quantity</label>
                                    <input type="number" class="form-control" id="stock-total" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Available Quantity</label>
                                    <input type="number" class="form-control" id="stock-avail" required>
                                </div>
                            </div>
                            <div class="modal-footer border-top-0">
                                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="submit" class="btn btn-primary">Update Stock</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        wrapper.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
    }
}

async function handleApproveBooking(id) {
    try {
        await API.approveBooking(id);
        alert('Booking approved successfully!');
        renderAdminFacilities();
    } catch (e) {
        alert(e.message);
    }
}

async function handleRejectBooking(id) {
    try {
        await API.rejectBooking(id);
        alert('Booking rejected.');
        renderAdminFacilities();
    } catch (e) {
        alert(e.message);
    }
}

let adjustStockModalInstance;
function showAdjustStockModal(id, total, avail) {
    document.getElementById('stock-eq-id').value = id;
    document.getElementById('stock-total').value = total;
    document.getElementById('stock-avail').value = avail;
    adjustStockModalInstance = new bootstrap.Modal(document.getElementById('adjustStockModal'));
    adjustStockModalInstance.show();
}

async function handleAdjustStock(e) {
    e.preventDefault();
    const id = document.getElementById('stock-eq-id').value;
    const totalQty = parseInt(document.getElementById('stock-total').value);
    const availableQty = parseInt(document.getElementById('stock-avail').value);

    try {
        await API.updateEquipmentStock(id, totalQty, availableQty);
        adjustStockModalInstance.hide();
        renderAdminFacilities();
    } catch (e) {
        alert(e.message);
    }
}

// 5. ADMIN: REPORTS & EXPORTS
function renderAdminReports() {
    const wrapper = document.getElementById('view-wrapper');
    wrapper.innerHTML = `
        <h3 class="mb-4">Export Reports & Analytics</h3>
        
        <div class="row g-4">
            <div class="col-md-4">
                <div class="custom-card text-center p-5">
                    <i class="fa-solid fa-users-viewfinder text-primary mb-3" style="font-size: 3rem;"></i>
                    <h5>Student Participation Report</h5>
                    <p class="text-muted small mb-4">Export roster directory listing including department demographics and achievements.</p>
                    <a href="/api/reports/participation" class="btn btn-primary w-100"><i class="fa-solid fa-download me-2"></i>Export Excel (CSV)</a>
                </div>
            </div>
            <div class="col-md-4">
                <div class="custom-card text-center p-5">
                    <i class="fa-solid fa-medal text-success mb-3" style="font-size: 3rem;"></i>
                    <h5>Tournament Report</h5>
                    <p class="text-muted small mb-4">Export match schedules, score grids, and champion records for Tournament ID 1.</p>
                    <a href="/api/reports/tournament/1" class="btn btn-success w-100"><i class="fa-solid fa-download me-2"></i>Export Excel (CSV)</a>
                </div>
            </div>
            <div class="col-md-4">
                <div class="custom-card text-center p-5">
                    <i class="fa-solid fa-clipboard-user text-warning mb-3" style="font-size: 3rem;"></i>
                    <h5>Attendance Roster Report</h5>
                    <p class="text-muted small mb-4">Export daily presence listings and attendance stats for Team ID 1.</p>
                    <a href="/api/reports/attendance/1" class="btn btn-warning w-100 text-white"><i class="fa-solid fa-download me-2"></i>Export Excel (CSV)</a>
                </div>
            </div>
        </div>
    `;
}

// 6. STUDENT: PROFILE
async function renderStudentProfile() {
    const wrapper = document.getElementById('view-wrapper');
    wrapper.innerHTML = `<div class="text-center p-5"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;

    try {
        const profile = await API.getStudentProfile(App.user.id);
        wrapper.innerHTML = `
            <h3 class="mb-4">Profile Settings</h3>
            <div class="custom-card">
                <form onsubmit="handleUpdateStudentProfile(event)">
                    <div class="mb-3">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-control" id="profile-name" value="${profile.user.name}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email address (cannot change)</label>
                        <input type="email" class="form-control" value="${profile.user.email}" readonly disabled>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Roll Number</label>
                            <input type="text" class="form-control" id="profile-roll" value="${profile.rollNo}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Year of Study</label>
                            <input type="number" class="form-control" id="profile-year" value="${profile.year}" required min="1" max="5">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Department</label>
                        <input type="text" class="form-control" id="profile-dept" value="${profile.dept}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Contact Number</label>
                        <input type="text" class="form-control" id="profile-contact" value="${profile.contact || ''}">
                    </div>
                    <div class="mb-4">
                        <label class="form-label">Achievements</label>
                        <textarea class="form-control" id="profile-achievements" rows="3">${profile.achievements || ''}</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary px-4 py-2">Update Profile</button>
                </form>
            </div>
        `;
    } catch (e) {
        wrapper.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
    }
}

async function handleUpdateStudentProfile(e) {
    e.preventDefault();
    const name = document.getElementById('profile-name').value;
    const rollNo = document.getElementById('profile-roll').value;
    const year = parseInt(document.getElementById('profile-year').value);
    const dept = document.getElementById('profile-dept').value;
    const contact = document.getElementById('profile-contact').value;
    const achievements = document.getElementById('profile-achievements').value;

    const payload = {
        user: { name },
        rollNo, year, dept, contact, achievements
    };

    try {
        await API.updateStudentProfile(App.user.id, payload);
        alert('Profile updated successfully!');
        localStorage.setItem('user_name', name);
        checkAuth();
    } catch (e) {
        alert(e.message);
    }
}

// 7. STUDENT: JOIN A TEAM
async function renderStudentTeams() {
    const wrapper = document.getElementById('view-wrapper');
    wrapper.innerHTML = `<div class="text-center p-5"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;

    try {
        const myTeams = await API.getStudentTeams(App.user.id);
        const myTeamIds = myTeams.map(t => t.id);

        wrapper.innerHTML = `
            <h3 class="mb-4">College Sports Teams</h3>
            
            <div class="custom-card mb-4">
                <h5 class="mb-3"><i class="fa-solid fa-shield-halved text-success"></i> My Enrolled Teams</h5>
                ${myTeams.length === 0 ? `<p class="text-muted">You are not enrolled in any teams yet.</p>` : `
                    <div class="list-group">
                        ${myTeams.map(t => `
                            <div class="list-group-item bg-transparent text-primary-emphasis d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>${t.name}</strong> (${t.sport.name})
                                </div>
                                <span class="badge bg-success">Active Member</span>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>

            <div class="custom-card">
                <h5 class="mb-3"><i class="fa-solid fa-users text-primary"></i> Available Teams Directory</h5>
                <div class="row g-4" id="available-teams-container">
                    <div class="col text-center p-3 text-muted">Loading other teams...</div>
                </div>
            </div>
        `;

        // Fetch all teams for enrollment
        const allSports = await API.getSports();
        const container = document.getElementById('available-teams-container');
        container.innerHTML = '';

        // Simple mock fetch of other teams (we will display custom teams like Mavericks and Warriors)
        const sampleTeams = [
            { id: 1, name: 'CSE Mavericks', sport: { name: 'Cricket' } },
            { id: 2, name: 'ECE Warriors', sport: { name: 'Cricket' } },
            { id: 3, name: 'EE Giants', sport: { name: 'Basketball' } },
            { id: 4, name: 'Civil Knights', sport: { name: 'Football' } }
        ];

        sampleTeams.forEach(t => {
            if (myTeamIds.includes(t.id)) return;

            const col = document.createElement('div');
            col.className = 'col-md-6';
            col.innerHTML = `
                <div class="border rounded p-3 d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1 fw-bold">${t.name}</h6>
                        <span class="text-muted small">${t.sport.name}</span>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="handleEnrollInTeam(${t.id})">Join Team</button>
                </div>
            `;
            container.appendChild(col);
        });

        if (container.children.length === 0) {
            container.innerHTML = '<div class="col text-center text-muted">No other teams available.</div>';
        }

    } catch (e) {
        wrapper.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
    }
}

async function handleEnrollInTeam(teamId) {
    try {
        await API.enrollInTeam(App.user.id, teamId);
        alert('Enrolled in team successfully!');
        renderStudentTeams();
    } catch (e) {
        alert(e.message);
    }
}

// 8. STUDENT: GROUND BOOKINGS
async function renderStudentBookings() {
    const wrapper = document.getElementById('view-wrapper');
    wrapper.innerHTML = `<div class="text-center p-5"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;

    try {
        const bookings = await API.getStudentBookings(App.user.id);
        const grounds = await API.getGrounds();

        wrapper.innerHTML = `
            <h3 class="mb-4">Facility Booking Hub</h3>
            
            <div class="row g-4">
                <div class="col-md-5">
                    <div class="custom-card">
                        <h5 class="mb-4"><i class="fa-solid fa-calendar-plus text-primary"></i> Reserve a Ground</h5>
                        <form onsubmit="handleRequestBooking(event)">
                            <div class="mb-3">
                                <label class="form-label">Select Facility</label>
                                <select class="form-select" id="book-ground-id" required>
                                    ${grounds.map(g => `<option value="${g.id}">${g.name} (${g.location})</option>`).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Booking Date</label>
                                <input type="date" class="form-control" id="book-date" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Start Time</label>
                                    <input type="time" class="form-control" id="book-start" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">End Time</label>
                                    <input type="time" class="form-control" id="book-end" required>
                                </div>
                            </div>
                            <div class="mb-4">
                                <label class="form-label">Purpose of Booking</label>
                                <textarea class="form-control" id="book-purpose" rows="3" placeholder="e.g. Squad Practice Session" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary w-100 py-2">Submit Request</button>
                        </form>
                    </div>
                </div>

                <div class="col-md-7">
                    <div class="custom-card">
                        <h5 class="mb-4"><i class="fa-solid fa-clock-rotate-left text-success"></i> My Booking History</h5>
                        <div class="table-responsive">
                            <table class="table table-hover table-custom align-middle">
                                <thead>
                                    <tr>
                                        <th>Ground</th>
                                        <th>Date</th>
                                        <th>Time Slot</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${bookings.map(b => `
                                        <tr>
                                            <td><strong>${b.ground.name}</strong></td>
                                            <td>${b.bookingDate}</td>
                                            <td>${b.startTime} - ${b.endTime}</td>
                                            <td><span class="badge ${b.status === 'Approved' ? 'bg-success' : b.status === 'Rejected' ? 'bg-danger' : 'bg-warning'}">${b.status}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        wrapper.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
    }
}

async function handleRequestBooking(e) {
    e.preventDefault();
    const groundId = parseInt(document.getElementById('book-ground-id').value);
    const bookingDate = document.getElementById('book-date').value;
    const startTime = document.getElementById('book-start').value + ':00';
    const endTime = document.getElementById('book-end').value + ':00';
    const purpose = document.getElementById('book-purpose').value;

    const ground = { id: groundId };

    try {
        await API.createBooking(App.user.id, { ground, bookingDate, startTime, endTime, purpose });
        alert('Booking requested successfully! Waiting for Admin approval.');
        renderStudentBookings();
    } catch (e) {
        alert(e.message);
    }
}

// 9. STUDENT: PERFORMANCE RATINGS
async function renderStudentPerformance() {
    const wrapper = document.getElementById('view-wrapper');
    wrapper.innerHTML = `<div class="text-center p-5"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;

    try {
        const records = await API.getPerformance(App.user.id);
        const prediction = await API.predictPlayerPerformance(App.user.id);

        wrapper.innerHTML = `
            <h3 class="mb-4">Performance Records & AI Predictions</h3>
            
            <div class="row g-4">
                <div class="col-md-6">
                    <div class="custom-card h-100">
                        <h5 class="mb-4 text-info"><i class="fa-solid fa-brain"></i> AI Performance Projection</h5>
                        
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h1 class="display-3 fw-bold text-primary mb-0">${prediction.predictedScore}</h1>
                                <span class="text-muted">Predicted Future Rating</span>
                            </div>
                            <div class="text-end">
                                <h4 class="fw-semibold mb-0">${prediction.confidenceScore}%</h4>
                                <span class="text-muted">Confidence Score</span>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="form-label">Recent Trend:</label>
                            <span class="badge ${prediction.performanceTrend === 'Improving' ? 'bg-success' : prediction.performanceTrend === 'Declining' ? 'bg-danger' : 'bg-primary'}">${prediction.performanceTrend}</span>
                        </div>

                        <h6 class="fw-semibold">AI Improvement Plan:</h6>
                        <ul class="list-group">
                            ${prediction.suggestions.map(s => `
                                <li class="list-group-item bg-transparent text-primary-emphasis border-0 px-0">
                                    <i class="fa-solid fa-circle-chevron-right text-info me-2"></i> ${s}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="custom-card h-100">
                        <h5 class="mb-4"><i class="fa-solid fa-star text-warning"></i> Match Statistics Log</h5>
                        <div class="table-responsive">
                            <table class="table table-hover table-custom align-middle">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Sport</th>
                                        <th>Score</th>
                                        <th>Feedback</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${records.map(r => `
                                        <tr>
                                            <td>${r.recordedDate}</td>
                                            <td>${r.sport.name}</td>
                                            <td><span class="badge bg-primary">${r.performanceScore}</span></td>
                                            <td class="small text-muted">${r.feedback}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        wrapper.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
    }
}

// 10. COACH: PROFILE
async function renderCoachProfile() {
    const wrapper = document.getElementById('view-wrapper');
    wrapper.innerHTML = `<div class="text-center p-5"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;

    try {
        const profile = await API.getCoachProfile(App.user.id);
        wrapper.innerHTML = `
            <h3 class="mb-4">Profile Settings</h3>
            <div class="custom-card">
                <form onsubmit="handleUpdateCoachProfile(event)">
                    <div class="mb-3">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-control" id="coach-profile-name" value="${profile.user.name}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email address (cannot change)</label>
                        <input type="email" class="form-control" value="${profile.user.email}" readonly disabled>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Coaching Specialization</label>
                        <input type="text" class="form-control" value="${profile.sport.name}" readonly disabled>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Experience (Years)</label>
                        <input type="number" class="form-control" id="coach-profile-exp" value="${profile.experience}" required min="0">
                    </div>
                    <div class="mb-4">
                        <label class="form-label">Contact Number</label>
                        <input type="text" class="form-control" id="coach-profile-contact" value="${profile.contact || ''}">
                    </div>
                    <button type="submit" class="btn btn-primary px-4 py-2">Update Profile</button>
                </form>
            </div>
        `;
    } catch (e) {
        wrapper.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
    }
}

async function handleUpdateCoachProfile(e) {
    e.preventDefault();
    const name = document.getElementById('coach-profile-name').value;
    const experience = parseInt(document.getElementById('coach-profile-exp').value);
    const contact = document.getElementById('coach-profile-contact').value;

    const payload = {
        user: { name },
        experience, contact
    };

    try {
        await API.updateCoachProfile(App.user.id, payload);
        alert('Profile updated successfully!');
        localStorage.setItem('user_name', name);
        checkAuth();
    } catch (e) {
        alert(e.message);
    }
}

// 11. COACH: RECORD ATTENDANCE
let attendancePlayersList = [];
async function renderCoachAttendance() {
    const wrapper = document.getElementById('view-wrapper');
    wrapper.innerHTML = `<div class="text-center p-5"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;

    try {
        const teams = await API.getCoachTeams(App.user.id);
        
        if (teams.length === 0) {
            wrapper.innerHTML = `<div class="alert alert-info">You are not assigned to any teams currently.</div>`;
            return;
        }

        wrapper.innerHTML = `
            <h3 class="mb-4">Record Attendance</h3>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="custom-card">
                        <h5>Select Team & Date</h5>
                        <div class="mb-3">
                            <label class="form-label">Team</label>
                            <select class="form-select" id="att-team-id" onchange="loadTeamPlayersForAttendance()">
                                ${teams.map(t => `<option value="${t.id}">${t.name} (${t.sport.name})</option>`).join('')}
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="form-label">Date</label>
                            <input type="date" class="form-control" id="att-date" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <button class="btn btn-primary w-100" onclick="loadTeamPlayersForAttendance()">Configure Roster</button>
                    </div>
                </div>

                <div class="col-md-8">
                    <div class="custom-card">
                        <h5>Roster Attendance</h5>
                        <div class="table-responsive">
                            <table class="table align-middle text-primary-emphasis">
                                <thead>
                                    <tr>
                                        <th>Player Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                id="attendance-table-body"
                                <tbody id="attendance-table-body">
                                    <tr><td colspan="3" class="text-center text-muted">Select a team and load roster to record attendance</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="text-end mt-4 d-none" id="attendance-submit-wrapper">
                            <button class="btn btn-success px-4" onclick="handleSubmitAttendance()">Save Attendance</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        loadTeamPlayersForAttendance();
    } catch (e) {
        wrapper.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
    }
}

async function loadTeamPlayersForAttendance() {
    const teamId = document.getElementById('att-team-id').value;
    const tbody = document.getElementById('attendance-table-body');
    const submitWrapper = document.getElementById('attendance-submit-wrapper');

    tbody.innerHTML = `<tr><td colspan="3" class="text-center"><i class="fa-solid fa-spinner fa-spin"></i></td></tr>`;
    submitWrapper.classList.add('d-none');

    try {
        const players = await API.getTeamPlayers(teamId);
        attendancePlayersList = players;

        if (players.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">No players registered in this team.</td></tr>`;
            return;
        }

        tbody.innerHTML = players.map(p => `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.email}</td>
                <td>
                    <div class="btn-group" role="group">
                        <input type="radio" class="btn-check" name="status-${p.id}" id="present-${p.id}" value="Present" checked autocomplete="off">
                        <label class="btn btn-sm btn-outline-success" for="present-${p.id}">Present</label>

                        <input type="radio" class="btn-check" name="status-${p.id}" id="absent-${p.id}" value="Absent" autocomplete="off">
                        <label class="btn btn-sm btn-outline-danger" for="absent-${p.id}">Absent</label>
                    </div>
                </td>
            </tr>
        `).join('');

        submitWrapper.classList.remove('d-none');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">${e.message}</td></tr>`;
    }
}

async function handleSubmitAttendance() {
    const teamId = parseInt(document.getElementById('att-team-id').value);
    const date = document.getElementById('att-date').value;

    const statusMap = {};
    attendancePlayersList.forEach(p => {
        const value = document.querySelector(`input[name="status-${p.id}"]:checked`).value;
        statusMap[p.id] = value;
    });

    try {
        await API.recordAttendance(teamId, date, statusMap);
        alert('Attendance logged successfully!');
    } catch (e) {
        alert(e.message);
    }
}

// 12. COACH: PERFORMANCE LOG
async function renderCoachPerformance() {
    const wrapper = document.getElementById('view-wrapper');
    wrapper.innerHTML = `<div class="text-center p-5"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;

    try {
        const teams = await API.getCoachTeams(App.user.id);
        
        if (teams.length === 0) {
            wrapper.innerHTML = `<div class="alert alert-info">You are not assigned to any teams currently.</div>`;
            return;
        }

        wrapper.innerHTML = `
            <h3 class="mb-4">Log Player Performance</h3>
            <div class="custom-card">
                <form onsubmit="handleRecordPerformance(event)">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Coached Team</label>
                            <select class="form-select" id="perf-team-id" onchange="loadPlayersForPerformanceDropdown()">
                                ${teams.map(t => `<option value="${t.id}" data-sport-id="${t.sport.id}">${t.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Select Player</label>
                            <select class="form-select" id="perf-student-id" required>
                                <!-- Injected dynamically -->
                            </select>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Match ID (Optional)</label>
                            <input type="number" class="form-control" id="perf-match-id" placeholder="e.g. 1">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Performance Rating (1-100)</label>
                            <input type="number" class="form-control" id="perf-score" required min="1" max="100" placeholder="85">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Custom Statistics JSON (Optional)</label>
                        <input type="text" class="form-control" id="perf-stats" placeholder='e.g. {"runs": 45, "wickets": 2}'>
                    </div>

                    <div class="mb-4">
                        <label class="form-label">Performance Feedback & Analysis</label>
                        <textarea class="form-control" id="perf-feedback" rows="3" required placeholder="Provide tactical feedback..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary px-4 py-2">Submit Record</button>
                </form>
            </div>
        `;

        loadPlayersForPerformanceDropdown();
    } catch (e) {
        wrapper.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
    }
}

async function loadPlayersForPerformanceDropdown() {
    const teamId = document.getElementById('perf-team-id').value;
    const select = document.getElementById('perf-student-id');

    select.innerHTML = `<option>Loading players...</option>`;

    try {
        const players = await API.getTeamPlayers(teamId);
        if (players.length === 0) {
            select.innerHTML = `<option>No players in team</option>`;
            return;
        }
        select.innerHTML = players.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    } catch (e) {
        select.innerHTML = `<option>${e.message}</option>`;
    }
}

async function handleRecordPerformance(e) {
    e.preventDefault();
    const studentId = parseInt(document.getElementById('perf-student-id').value);
    const score = parseInt(document.getElementById('perf-score').value);
    const feedback = document.getElementById('perf-feedback').value;
    const matchIdVal = document.getElementById('perf-match-id').value;
    const matchId = matchIdVal ? parseInt(matchIdVal) : null;
    const statsJson = document.getElementById('perf-stats').value || null;

    const teamDropdown = document.getElementById('perf-team-id');
    const sportId = parseInt(teamDropdown.options[teamDropdown.selectedIndex].getAttribute('data-sport-id'));

    try {
        await API.recordPerformance(studentId, sportId, matchId, score, statsJson, feedback);
        alert('Player performance record logged successfully!');
        
        // Reset form inputs except selector dropdowns
        document.getElementById('perf-score').value = '';
        document.getElementById('perf-match-id').value = '';
        document.getElementById('perf-stats').value = '';
        document.getElementById('perf-feedback').value = '';
    } catch (e) {
        alert(e.message);
    }
}

// 13. COACH: TEAM ANALYTICS
async function renderCoachAnalytics() {
    const wrapper = document.getElementById('view-wrapper');
    wrapper.innerHTML = `<div class="text-center p-5"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;

    try {
        const teams = await API.getCoachTeams(App.user.id);
        
        if (teams.length === 0) {
            wrapper.innerHTML = `<div class="alert alert-info">You do not coach any teams currently.</div>`;
            return;
        }

        wrapper.innerHTML = `
            <h3 class="mb-4">Team Performance Analytics</h3>
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="custom-card">
                        <label class="form-label fw-bold">Select Active Team</label>
                        <select class="form-select" id="analytics-team-id" onchange="loadTeamAnalyticsGraph()">
                            ${teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>

            <div id="analytics-content-panel">
                <!-- Injected dynamically -->
            </div>
        `;

        loadTeamAnalyticsGraph();
    } catch (e) {
        wrapper.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
    }
}

async function loadTeamAnalyticsGraph() {
    const teamId = document.getElementById('analytics-team-id').value;
    const panel = document.getElementById('analytics-content-panel');

    panel.innerHTML = `<div class="text-center p-4"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;

    try {
        const data = await API.getTeamAnalytics(teamId);
        
        panel.innerHTML = `
            <div class="row g-4 mb-4">
                <div class="col-md-4">
                    <div class="metric-card">
                        <div>
                            <h2 class="fw-bold">${data.playerCount}</h2>
                            <span class="text-muted">Registered Roster</span>
                        </div>
                        <div class="icon-box bg-primary"><i class="fa-solid fa-users"></i></div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="metric-card">
                        <div>
                            <h2 class="fw-bold">${data.attendanceRate}%</h2>
                            <span class="text-muted">Attendance Rate</span>
                        </div>
                        <div class="icon-box bg-success"><i class="fa-solid fa-clipboard-user"></i></div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="metric-card">
                        <div>
                            <h2 class="fw-bold">${data.avgPerformanceScore}</h2>
                            <span class="text-muted">Average Player Rating</span>
                        </div>
                        <div class="icon-box bg-warning"><i class="fa-solid fa-star"></i></div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <div class="custom-card" style="height: 350px;">
                        <h5><i class="fa-solid fa-chart-column text-primary"></i> Team KPIs Summary</h5>
                        <canvas id="team-kpi-chart"></canvas>
                    </div>
                </div>
            </div>
        `;

        // Render chart
        setTimeout(() => {
            CHARTS.renderBarChart('team-kpi-chart', 'Value', ['Attendance Rate (%)', 'Average Rating (1-100)'], [data.attendanceRate, data.avgPerformanceScore], '#10b981');
        }, 50);

    } catch (e) {
        panel.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
    }
}

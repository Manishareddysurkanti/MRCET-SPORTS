const BASE_URL = ''; // Same domain, served statically

const API = {
    getToken() {
        return localStorage.getItem('jwt_token');
    },

    getHeaders() {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    async request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        options.headers = {
            ...this.getHeaders(),
            ...options.headers
        };

        try {
            const response = await fetch(url, options);
            
            // Check for unauthorized status
            if (response.status === 401) {
                this.logout();
                throw new Error('Session expired. Please log in again.');
            }

            // Check if response is file download (CSV)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/csv')) {
                return await response.text();
            }

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }
            return data;
        } catch (error) {
            console.error(`API Error: ${url}`, error);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');
        window.location.reload();
    },

    // Auth Operations
    async login(email, password) {
        const data = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('user_name', data.name);
        localStorage.setItem('user_email', data.email);
        localStorage.setItem('user_role', data.role);
        localStorage.setItem('user_id', data.userId);
        return data;
    },

    async registerStudent(name, email, password, rollNo, dept, year, contact) {
        return await this.request('/api/auth/register/student', {
            method: 'POST',
            body: JSON.stringify({
                user: { name, email, password },
                rollNo, dept, year, contact
            })
        });
    },

    async registerCoach(name, email, password, sportId, experience, contact) {
        return await this.request('/api/auth/register/coach', {
            method: 'POST',
            body: JSON.stringify({
                user: { name, email, password },
                sportId, experience, contact
            })
        });
    },

    // Admin Operations
    async getStats() {
        return await this.request('/api/admin/stats');
    },

    async getStudents() {
        return await this.request('/api/admin/students');
    },

    async getCoaches() {
        return await this.request('/api/admin/coaches');
    },

    async getSports() {
        return await this.request('/api/admin/sports');
    },

    async saveSport(sport) {
        return await this.request('/api/admin/sports', {
            method: 'POST',
            body: JSON.stringify(sport)
        });
    },

    async deleteSport(id) {
        return await this.request(`/api/admin/sports/${id}`, {
            method: 'DELETE'
        });
    },

    async getGrounds() {
        return await this.request('/api/admin/grounds');
    },

    async saveGround(ground) {
        return await this.request('/api/admin/grounds', {
            method: 'POST',
            body: JSON.stringify(ground)
        });
    },

    async deleteGround(id) {
        return await this.request(`/api/admin/grounds/${id}`, {
            method: 'DELETE'
        });
    },

    async getEquipment() {
        return await this.request('/api/admin/equipment');
    },

    async saveEquipment(equipment) {
        return await this.request('/api/admin/equipment', {
            method: 'POST',
            body: JSON.stringify(equipment)
        });
    },

    async deleteEquipment(id) {
        return await this.request(`/api/admin/equipment/${id}`, {
            method: 'DELETE'
        });
    },

    // Student Operations
    async getStudentProfile(userId) {
        return await this.request(`/api/student/profile/${userId}`);
    },

    async updateStudentProfile(userId, profile) {
        return await this.request(`/api/student/profile/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(profile)
        });
    },

    async getStudentTeams(userId) {
        return await this.request(`/api/student/teams/${userId}`);
    },

    async enrollInTeam(userId, teamId) {
        return await this.request('/api/student/teams/enroll', {
            method: 'POST',
            body: JSON.stringify({ userId, teamId })
        });
    },

    async getStudentBookings(userId) {
        return await this.request(`/api/student/bookings/${userId}`);
    },

    async createBooking(userId, booking) {
        return await this.request(`/api/student/bookings/${userId}`, {
            method: 'POST',
            body: JSON.stringify(booking)
        });
    },

    async getPerformance(userId) {
        return await this.request(`/api/student/performance/${userId}`);
    },

    async getNotifications(userId) {
        return await this.request(`/api/student/notifications/${userId}`);
    },

    async markNotificationRead(id) {
        return await this.request(`/api/student/notifications/${id}/read`, {
            method: 'PUT'
        });
    },

    // Coach Operations
    async getCoachProfile(userId) {
        return await this.request(`/api/coach/profile/${userId}`);
    },

    async updateCoachProfile(userId, profile) {
        return await this.request(`/api/coach/profile/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(profile)
        });
    },

    async getCoachTeams(userId) {
        return await this.request(`/api/coach/teams/${userId}`);
    },

    async getTeamPlayers(teamId) {
        return await this.request(`/api/coach/team-players/${teamId}`);
    },

    async recordAttendance(teamId, date, statusMap) {
        return await this.request('/api/coach/attendance', {
            method: 'POST',
            body: JSON.stringify({ teamId, date, statusMap })
        });
    },

    async getAttendanceHistory(teamId) {
        return await this.request(`/api/coach/attendance/${teamId}`);
    },

    async recordPerformance(studentId, sportId, matchId, score, statsJson, feedback) {
        return await this.request('/api/coach/performance', {
            method: 'POST',
            body: JSON.stringify({ studentId, sportId, matchId, score, statsJson, feedback })
        });
    },

    async getTeamAnalytics(teamId) {
        return await this.request(`/api/coach/team-analytics/${teamId}`);
    },

    // Tournament Operations
    async getTournaments() {
        return await this.request('/api/tournaments');
    },

    async getTournamentDetails(id) {
        return await this.request(`/api/tournaments/${id}`);
    },

    async createTournament(tournament) {
        return await this.request('/api/tournaments', {
            method: 'POST',
            body: JSON.stringify(tournament)
        });
    },

    async generateFixtures(tournamentId) {
        return await this.request(`/api/tournaments/fixtures/${tournamentId}`, {
            method: 'POST'
        });
    },

    async updateMatchScore(matchId, scoreTeam1, scoreTeam2, winnerTeamId) {
        return await this.request(`/api/tournaments/match/${matchId}/score`, {
            method: 'POST',
            body: JSON.stringify({ scoreTeam1, scoreTeam2, winnerTeamId })
        });
    },

    async getPointsTable(tournamentId) {
        return await this.request(`/api/tournaments/points-table/${tournamentId}`);
    },

    async declareTournamentWinner(tournamentId, winnerTeamId) {
        return await this.request(`/api/tournaments/${tournamentId}/winner`, {
            method: 'POST',
            body: JSON.stringify({ winnerTeamId })
        });
    },

    // Facility Booking Admin Operations
    async getAllBookings() {
        return await this.request('/api/facility/bookings');
    },

    async approveBooking(bookingId) {
        return await this.request(`/api/facility/bookings/${bookingId}/approve`, {
            method: 'POST'
        });
    },

    async rejectBooking(bookingId) {
        return await this.request(`/api/facility/bookings/${bookingId}/reject`, {
            method: 'POST'
        });
    },

    async updateEquipmentStock(equipmentId, totalQty, availableQty) {
        return await this.request(`/api/facility/equipment/${equipmentId}/stock`, {
            method: 'POST',
            body: JSON.stringify({ totalQty, availableQty })
        });
    },

    // AI Features Operations
    async predictPlayerPerformance(studentId) {
        return await this.request(`/api/ai/predict-performance/${studentId}`);
    },

    async predictMatchOutcome(matchId) {
        return await this.request(`/api/ai/predict-match-outcome/${matchId}`);
    },

    async getTrainingRecommendations(studentId) {
        return await this.request(`/api/ai/training-recommendations/${studentId}`);
    },

    async queryChatbot(message, userId) {
        return await this.request('/api/ai/chatbot/query', {
            method: 'POST',
            body: JSON.stringify({ message, userId })
        });
    }
};

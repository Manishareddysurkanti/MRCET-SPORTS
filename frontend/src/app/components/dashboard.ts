import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  // User details
  userName = '';
  userRole = '';
  userId: number | null = null;

  // Active Panel Tab
  activeTab = 'stats'; // Default tab

  // Common UI Lists
  sportsList: any[] = [];
  tournamentsList: any[] = [];
  groundsList: any[] = [];
  equipmentsList: any[] = [];

  // Admin Data lists
  adminStats: any = null;
  studentsList: any[] = [];
  coachesList: any[] = [];

  // Student Data lists
  studentProfile: any = {};
  studentTeams: any[] = [];
  studentBookings: any[] = [];
  studentPerformance: any[] = [];
  notifications: any[] = [];

  // Coach Data lists
  coachProfile: any = {};
  attendanceRecords: any[] = [];

  // Forms / Modals Data Binding
  newSport = { name: '', type: 'TEAM', description: '', rules: '' };
  newGround = { name: '', location: '', status: 'Available' };
  newEquipment = { name: '', sportId: 1, totalQty: 10, availableQty: 10 };
  newTournament = { name: '', sportId: 1, startDate: '', endDate: '', status: 'Upcoming', type: 'ROUND_ROBIN' };
  newBooking = { groundId: 1, purpose: '', bookingDate: '', startTime: '', endTime: '' };
  
  selectedTournamentId: number | null = null;
  pointsTable: any[] = [];
  fixturesList: any[] = [];

  // Score updater bindings
  selectedMatchId: number | null = null;
  scoreTeam1 = 0;
  scoreTeam2 = 0;
  winnerTeamId: number | null = null;

  // Messages
  errorMsg = '';
  successMsg = '';

  ngOnInit(): void {
    if (!this.api.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.userName = this.api.getUserName() || 'User';
    this.userRole = this.api.getUserRole() || '';
    this.userId = this.api.getUserId();

    // Set default tab based on role
    if (this.userRole === 'STUDENT') {
      this.activeTab = 'student-profile';
      this.loadStudentData();
    } else if (this.userRole === 'COACH') {
      this.activeTab = 'coach-profile';
      this.loadCoachData();
    } else {
      this.activeTab = 'stats';
      this.loadAdminData();
    }
  }

  // DATA LOADING METHODS
  loadAdminData() {
    this.api.getAdminStats().subscribe(res => this.adminStats = res);
    this.api.getAllStudents().subscribe(res => this.studentsList = res);
    this.api.getAllCoaches().subscribe(res => this.coachesList = res);
    this.api.getAllSports().subscribe(res => this.sportsList = res);
    this.api.getAllGrounds().subscribe(res => this.groundsList = res);
    this.api.getAllEquipment().subscribe(res => this.equipmentsList = res);
    this.api.getAllTournaments().subscribe(res => this.tournamentsList = res);
  }

  loadStudentData() {
    if (!this.userId) return;
    this.api.getStudentProfile(this.userId).subscribe(res => this.studentProfile = res);
    this.api.getStudentTeams(this.userId).subscribe(res => this.studentTeams = res);
    this.api.getStudentBookings(this.userId).subscribe(res => this.studentBookings = res);
    this.api.getStudentPerformance(this.userId).subscribe(res => this.studentPerformance = res);
    this.api.getNotifications(this.userId).subscribe(res => this.notifications = res);
    this.api.getAllTournaments().subscribe(res => this.tournamentsList = res);
    this.api.getAllGrounds().subscribe(res => this.groundsList = res);
    this.api.getAllSports().subscribe(res => this.sportsList = res);
  }

  loadCoachData() {
    if (!this.userId) return;
    // Load coach profile and related services
    this.api.getAllSports().subscribe(res => this.sportsList = res);
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.errorMsg = '';
    this.successMsg = '';

    if (this.userRole === 'ADMIN') {
      this.loadAdminData();
    } else if (this.userRole === 'STUDENT') {
      this.loadStudentData();
    }
  }

  // STUDENT OPERATIONS
  saveProfile() {
    if (!this.userId) return;
    this.api.updateStudentProfile(this.userId, this.studentProfile).subscribe({
      next: () => {
        this.successMsg = 'Profile updated successfully!';
      },
      error: () => this.errorMsg = 'Failed to update profile.'
    });
  }

  bookGround() {
    if (!this.userId) return;
    const booking = {
      ground: { id: this.newBooking.groundId },
      bookingDate: this.newBooking.bookingDate,
      startTime: this.newBooking.startTime + ':00',
      endTime: this.newBooking.endTime + ':00',
      purpose: this.newBooking.purpose,
      status: 'PENDING'
    };
    this.api.createStudentBooking(this.userId, booking).subscribe({
      next: () => {
        this.successMsg = 'Booking request submitted successfully!';
        this.loadStudentData();
      },
      error: (err) => this.errorMsg = err.error?.error || 'Failed to request booking.'
    });
  }

  markRead(notificationId: number) {
    this.api.markNotificationRead(notificationId).subscribe(() => {
      this.loadStudentData();
    });
  }

  // ADMIN OPERATIONS
  addSport() {
    this.api.saveSport(this.newSport).subscribe({
      next: () => {
        this.successMsg = 'Sport category added successfully!';
        this.newSport = { name: '', type: 'TEAM', description: '', rules: '' };
        this.loadAdminData();
      },
      error: (err) => this.errorMsg = err.error?.error || 'Failed to save sport.'
    });
  }

  deleteSport(id: number) {
    this.api.deleteSport(id).subscribe(() => this.loadAdminData());
  }

  addGround() {
    const payload = {
      name: this.newGround.name,
      location: this.newGround.location,
      status: this.newGround.status || 'Available'
    };
    this.api.saveGround(payload).subscribe({
      next: () => {
        this.successMsg = 'Ground added successfully!';
        this.newGround = { name: '', location: '', status: 'Available' };
        this.loadAdminData();
      },
      error: (err) => this.errorMsg = err.error?.error || 'Failed to save ground.'
    });
  }

  deleteGround(id: number) {
    this.api.deleteGround(id).subscribe(() => this.loadAdminData());
  }

  addEquipment() {
    const payload = {
      name: this.newEquipment.name,
      sport: { id: parseInt(this.newEquipment.sportId.toString(), 10) },
      totalQty: parseInt(this.newEquipment.totalQty.toString(), 10),
      availableQty: parseInt(this.newEquipment.availableQty.toString(), 10)
    };
    this.api.saveEquipment(payload).subscribe({
      next: () => {
        this.successMsg = 'Equipment stock saved!';
        this.newEquipment = { name: '', sportId: 1, totalQty: 10, availableQty: 10 };
        this.loadAdminData();
      },
      error: (err) => this.errorMsg = err.error?.error || 'Failed to save equipment.'
    });
  }

  deleteEquipment(id: number) {
    this.api.deleteEquipment(id).subscribe(() => this.loadAdminData());
  }

  // TOURNAMENT DETAILS & POINTS TABLE
  loadTournamentDetails(id: number) {
    this.selectedTournamentId = id;
    this.api.getPointsTable(id).subscribe(res => this.pointsTable = res);
    // Fetch individual matches
    this.api.getAllTournaments().subscribe(res => {
      const tourn = res.find(t => t.id === id);
      if (tourn) {
        this.fixturesList = tourn.matches || [];
      }
    });
  }

  generateFixturesBtn() {
    if (!this.selectedTournamentId) return;
    this.api.generateFixtures(this.selectedTournamentId).subscribe({
      next: () => {
        this.successMsg = 'Fixtures generated successfully!';
        this.loadTournamentDetails(this.selectedTournamentId!);
      },
      error: (err) => this.errorMsg = err.error?.error || 'Failed to generate fixtures.'
    });
  }

  addTournament() {
    const payload = {
      name: this.newTournament.name,
      sport: { id: parseInt(this.newTournament.sportId.toString(), 10) },
      startDate: this.newTournament.startDate,
      endDate: this.newTournament.endDate,
      status: this.newTournament.status,
      type: this.newTournament.type
    };

    this.api.createTournament(payload).subscribe({
      next: () => {
        this.successMsg = 'Tournament created successfully!';
        this.newTournament = { name: '', sportId: 1, startDate: '', endDate: '', status: 'Upcoming', type: 'ROUND_ROBIN' };
        this.loadAdminData();
      },
      error: (err) => this.errorMsg = err.error?.error || 'Failed to save tournament.'
    });
  }

  openScoreModal(match: any) {
    this.selectedMatchId = match.id;
    this.scoreTeam1 = match.scoreTeam1 || 0;
    this.scoreTeam2 = match.scoreTeam2 || 0;
    this.winnerTeamId = match.winnerTeam?.id || null;
  }

  saveScore() {
    if (!this.selectedMatchId) return;
    this.api.updateMatchScore(this.selectedMatchId, this.scoreTeam1, this.scoreTeam2, this.winnerTeamId || undefined).subscribe({
      next: () => {
        this.successMsg = 'Scores updated!';
        if (this.selectedTournamentId) {
          this.loadTournamentDetails(this.selectedTournamentId);
        }
      },
      error: (err) => this.errorMsg = err.error?.error || 'Failed to update score.'
    });
  }

  logout() {
    this.api.logout();
  }
}

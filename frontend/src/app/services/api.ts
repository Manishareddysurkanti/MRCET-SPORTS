import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = ''; // Relative path because they are co-hosted!

  // Token Management
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Auth Operations
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/auth/login`, credentials).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('jwt_token', res.token);
          localStorage.setItem('user_name', res.name);
          localStorage.setItem('user_email', res.email);
          localStorage.setItem('user_role', res.role);
          localStorage.setItem('user_id', res.userId);
        }
      })
    );
  }

  registerStudent(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/auth/register/student`, payload);
  }

  registerCoach(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/auth/register/coach`, payload);
  }

  logout(): void {
    localStorage.clear();
    window.location.href = '/';
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }

  getUserName(): string | null {
    return localStorage.getItem('user_name');
  }

  getUserId(): number | null {
    const id = localStorage.getItem('user_id');
    return id ? parseInt(id, 10) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Student API operations
  getStudentProfile(userId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/student/profile/${userId}`, { headers: this.getHeaders() });
  }

  updateStudentProfile(userId: number, profile: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/student/profile/${userId}`, profile, { headers: this.getHeaders() });
  }

  getStudentTeams(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/student/teams/${userId}`, { headers: this.getHeaders() });
  }

  enrollInTeam(userId: number, teamId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/student/teams/enroll`, { userId, teamId }, { headers: this.getHeaders() });
  }

  getStudentBookings(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/student/bookings/${userId}`, { headers: this.getHeaders() });
  }

  createStudentBooking(userId: number, booking: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/student/bookings/${userId}`, booking, { headers: this.getHeaders() });
  }

  getStudentPerformance(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/student/performance/${userId}`, { headers: this.getHeaders() });
  }

  getNotifications(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/student/notifications/${userId}`, { headers: this.getHeaders() });
  }

  markNotificationRead(notificationId: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/student/notifications/${notificationId}/read`, {}, { headers: this.getHeaders() });
  }

  // Admin API operations
  getAdminStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/admin/stats`, { headers: this.getHeaders() });
  }

  getAllStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/admin/students`, { headers: this.getHeaders() });
  }

  getAllCoaches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/admin/coaches`, { headers: this.getHeaders() });
  }

  getAllSports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/admin/sports`, { headers: this.getHeaders() });
  }

  saveSport(sport: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/admin/sports`, sport, { headers: this.getHeaders() });
  }

  deleteSport(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/admin/sports/${id}`, { headers: this.getHeaders() });
  }

  getAllGrounds(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/admin/grounds`, { headers: this.getHeaders() });
  }

  saveGround(ground: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/admin/grounds`, ground, { headers: this.getHeaders() });
  }

  deleteGround(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/admin/grounds/${id}`, { headers: this.getHeaders() });
  }

  getAllEquipment(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/admin/equipment`, { headers: this.getHeaders() });
  }

  saveEquipment(equipment: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/admin/equipment`, equipment, { headers: this.getHeaders() });
  }

  deleteEquipment(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/admin/equipment/${id}`, { headers: this.getHeaders() });
  }

  // Tournament operations
  getAllTournaments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/tournaments`, { headers: this.getHeaders() });
  }

  createTournament(tournament: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/tournaments`, tournament, { headers: this.getHeaders() });
  }

  generateFixtures(tournamentId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/tournaments/fixtures/${tournamentId}`, {}, { headers: this.getHeaders() });
  }

  updateMatchScore(matchId: number, scoreTeam1: number, scoreTeam2: number, winnerTeamId?: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/tournaments/match/${matchId}/score`, { scoreTeam1, scoreTeam2, winnerTeamId }, { headers: this.getHeaders() });
  }

  getPointsTable(tournamentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/tournaments/points-table/${tournamentId}`, { headers: this.getHeaders() });
  }

  declareTournamentWinner(tournamentId: number, winnerTeamId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/tournaments/${tournamentId}/winner`, { winnerTeamId }, { headers: this.getHeaders() });
  }

  // General Sports list
  getSportsList(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/admin/sports`, { headers: this.getHeaders() });
  }
}

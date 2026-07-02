import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html'
})
export class Login {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  // Toggle between 'login' and 'register'
  viewMode = signal<'login' | 'register'>('login');
  
  // Registration role switcher
  regRole = signal<'STUDENT' | 'COACH'>('STUDENT');

  // Input states
  email = '';
  password = '';
  name = '';
  contact = '';
  errorMsg = '';
  successMsg = '';

  // Student specific inputs
  rollNo = '';
  dept = '';
  year = '1';

  // Coach specific inputs
  sportId = '1';
  experience = '1';

  // Demo account helper auto-fill
  fillDemo(emailVal: string) {
    this.email = emailVal;
    this.password = 'password123';
    this.errorMsg = '';
    this.successMsg = '';
  }

  toggleView(mode: 'login' | 'register') {
    this.viewMode.set(mode);
    this.errorMsg = '';
    this.successMsg = '';
  }

  setRegRole(role: 'STUDENT' | 'COACH') {
    this.regRole.set(role);
    this.errorMsg = '';
  }

  handleLogin(event: Event) {
    event.preventDefault();
    this.errorMsg = '';
    this.successMsg = '';

    const credentials = { email: this.email, password: this.password };
    this.api.login(credentials).subscribe({
      next: (res) => {
        const role = res.role;
        if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (role === 'COACH') {
          this.router.navigate(['/coach']);
        } else {
          this.router.navigate(['/student']);
        }
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'Invalid email or password.';
      }
    });
  }

  handleRegister(event: Event) {
    event.preventDefault();
    this.errorMsg = '';
    this.successMsg = '';

    if (this.regRole() === 'STUDENT') {
      const payload = {
        user: {
          name: this.name,
          email: this.email,
          password: this.password
        },
        rollNo: this.rollNo,
        dept: this.dept,
        year: parseInt(this.year, 10),
        contact: this.contact
      };

      this.api.registerStudent(payload).subscribe({
        next: () => {
          this.successMsg = 'Student account created successfully! Please log in.';
          this.toggleView('login');
        },
        error: (err) => {
          this.errorMsg = err.error?.error || 'Failed to register student.';
        }
      });
    } else {
      const payload = {
        user: {
          name: this.name,
          email: this.email,
          password: this.password
        },
        sportId: parseInt(this.sportId, 10),
        experience: parseInt(this.experience, 10),
        contact: this.contact
      };

      this.api.registerCoach(payload).subscribe({
        next: () => {
          this.successMsg = 'Coach account created successfully! Please log in.';
          this.toggleView('login');
        },
        error: (err) => {
          this.errorMsg = err.error?.error || 'Failed to register coach.';
        }
      });
    }
  }
}

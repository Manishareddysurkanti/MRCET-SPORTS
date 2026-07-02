import { Routes } from '@angular/router';
import { Login } from './components/login';
import { Dashboard } from './components/dashboard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'admin', component: Dashboard },
  { path: 'student', component: Dashboard },
  { path: 'coach', component: Dashboard },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

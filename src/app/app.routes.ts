import { Routes } from '@angular/router';
import { Login } from './page/login/login';
import { Home } from './page/home/home';
import { authGuard, guestGuard } from './service/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', canActivate: [guestGuard], component: Login },
  {
    path: 'home',
    canActivate: [authGuard],
    component: Home,
  },
  { path: '**', redirectTo: '/home' },
];

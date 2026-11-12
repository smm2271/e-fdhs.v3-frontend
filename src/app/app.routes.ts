import { Routes } from '@angular/router';
import { Login } from './page/login/login';
import { Home } from './page/home/home';
import { authGuard } from './service/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'home',
    canActivate: [authGuard],
    component: Home,
  },
];

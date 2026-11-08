import { Routes } from '@angular/router';
import { Login } from './page/login/login';
import { authGuard } from './service/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'home',
    canActivate: [authGuard],
    // TODO: 首頁建立後，以 component 或 loadComponent 替換 children。
    children: [],
  },
];

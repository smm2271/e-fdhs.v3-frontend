import { Routes } from '@angular/router';
import { authGuard, guestGuard, permissionGuard } from './service/auth/auth.guard';
import { PAGE_DEFINITIONS, PAGE_URLS } from './service/page/page.config';

export const routes: Routes = [
  { path: '', redirectTo: PAGE_URLS.home, pathMatch: 'full' },
  ...Object.values(PAGE_DEFINITIONS)
    .filter(page => page.kind === 'link')
    .map(page => ({
      path: page.path,
      title: page.label,
      loadComponent: page.loadComponent,
      data: { accessPolicy: 'policy' in page ? page.policy : undefined },
      canActivate: page.access === 'guest' ? [guestGuard] : [authGuard, permissionGuard],
    })),
  {
    path: '**', title: PAGE_DEFINITIONS.notFound.label,
    canActivate: [authGuard], loadComponent: PAGE_DEFINITIONS.notFound.loadComponent,
  },
];

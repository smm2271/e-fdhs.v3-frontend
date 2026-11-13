import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';
import { getLoginDestination } from './auth.redirect';
import { PAGE_URLS } from '../page/page.config';
import { PermissionService } from '../permission/permission';
import type { AccessPolicy } from '../permission/permission.model';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([PAGE_URLS.login], {
    queryParams: { returnUrl: state.url },
  });
};

export const permissionGuard: CanActivateFn = (route) => {
  // 未登入的導流交由前面的 authGuard 處理，保留原始 returnUrl。
  if (!inject(Auth).isAuthenticated()) return true;
  return inject(PermissionService).canAccess(route.data['accessPolicy'] as AccessPolicy | undefined)
    ? true
    : inject(Router).createUrlTree([PAGE_URLS.notFound]);
};

export const guestGuard: CanActivateFn = (route) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.isAuthenticated()
    ? router.parseUrl(getLoginDestination(router, route.queryParamMap.get('returnUrl')))
    : true;
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';
import { getLoginDestination } from './auth.redirect';
import { PAGE_URLS } from '../page/page.config';

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

export const guestGuard: CanActivateFn = (route) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.isAuthenticated()
    ? router.parseUrl(getLoginDestination(router, route.queryParamMap.get('returnUrl')))
    : true;
};

import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from '../../app.routes';
import { Auth } from './auth';

describe('authGuard', () => {
  let router: Router;
  let auth: Auth;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    router = TestBed.inject(Router);
    auth = TestBed.inject(Auth);
  });

  it('redirects unauthenticated users and preserves the requested URL', async () => {
    await router.navigateByUrl('/home?tab=profile#details');

    const url = router.parseUrl(router.url);
    expect(url.root.children['primary'].segments.map(segment => segment.path)).toEqual(['login']);
    expect(url.queryParams['returnUrl']).toBe('/home?tab=profile#details');
  });

  it('allows authenticated users to visit a protected route', async () => {
    auth.login({ email: 'demo@example.com', password: '123456' });

    await router.navigateByUrl('/home');

    expect(router.url).toBe('/home');
  });

  it('keeps the login page accessible without authentication', async () => {
    await router.navigateByUrl('/login');

    expect(router.url).toBe('/login');
  });
});

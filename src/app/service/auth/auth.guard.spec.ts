import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from '../../app.routes';
import { Auth, AUTH_STORAGE_KEY } from './auth';

describe('authGuard', () => {
  let router: Router;
  let auth: Auth;

  beforeEach(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    router = TestBed.inject(Router);
    auth = TestBed.inject(Auth);
  });

  afterEach(() => localStorage.removeItem(AUTH_STORAGE_KEY));

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

  it('restores authentication before the first guarded navigation', async () => {
    TestBed.resetTestingModule();
    localStorage.setItem(AUTH_STORAGE_KEY, '2');
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    router = TestBed.inject(Router);

    await router.navigateByUrl('/home?tab=profile#details');

    expect(router.url).toBe('/home?tab=profile#details');
    expect(TestBed.inject(Auth).currentUser()?.id).toBe('2');
  });

  it('redirects authenticated users away from login to their requested page', async () => {
    auth.login({ email: 'demo@example.com', password: '123456' });

    await router.navigate(['/login'], { queryParams: { returnUrl: '/home?tab=profile#details' } });

    expect(router.url).toBe('/home?tab=profile#details');
  });

  it.each([null, '/login', '/login?returnUrl=/login', '//example.com', 'https://example.com', '/%6cogin', '/\\example.com'])
    ('falls back to home for an invalid login destination: %s', async (returnUrl) => {
      auth.login({ email: 'demo@example.com', password: '123456' });

      await router.navigate(['/login'], { queryParams: { returnUrl } });

      expect(router.url).toBe('/home');
    });

  it('blocks protected routes again after logout', async () => {
    auth.login({ email: 'demo@example.com', password: '123456' });
    await router.navigateByUrl('/home');
    auth.logout();
    await router.navigateByUrl('/login');
    await router.navigateByUrl('/home?tab=profile');

    expect(router.parseUrl(router.url).queryParams['returnUrl']).toBe('/home?tab=profile');
    expect(router.url.startsWith('/login?')).toBe(true);
  });

  it.each([false, true])('routes unknown paths according to login state: %s', async (loggedIn) => {
    if (loggedIn) auth.login({ email: 'demo@example.com', password: '123456' });

    await router.navigateByUrl('/unknown');

    expect(router.url).toBe(loggedIn ? '/unknown' : '/login?returnUrl=%2Funknown');
  });
});

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from '../../app';
import { routes } from '../../app.routes';
import { Auth, AUTH_STORAGE_KEY } from '../auth/auth';
import { authGuard, permissionGuard } from '../auth/auth.guard';

@Component({ template: '<h1>機密測試頁面</h1>' })
class RestrictedPage {}

describe('permission routing', () => {
  beforeEach(async () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    await TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([
      { path: 'restricted', component: RestrictedPage, canActivate: [authGuard, permissionGuard],
        data: { accessPolicy: { allowedGroupIds: ['staff', 'admin'], anyPermissions: ['class.password.read'] } } },
      ...routes,
    ])] }).compileComponents();
  });
  afterEach(() => localStorage.removeItem(AUTH_STORAGE_KEY));

  it('renders an allowed page and blocks a student without activating the protected content', async () => {
    const auth = TestBed.inject(Auth);
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    auth.login({ email: 'demo2', password: '114514' });
    await router.navigateByUrl('/restricted');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('機密測試頁面');

    await router.navigateByUrl('/home');
    auth.login({ email: 'demo@example.com', password: '123456' });
    await router.navigateByUrl('/restricted');
    await fixture.whenStable();
    expect(router.url).toBe('/404');
    expect(fixture.nativeElement.querySelector('app-not-found')).not.toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('機密測試頁面');
    fixture.destroy();
  });

  it.each(['/restricted?tab=one#section', '/unknown?tab=one#section'])
    ('preserves an anonymous URL and displays 404 after student login: %s', async (url) => {
      const router = TestBed.inject(Router);
      const fixture = TestBed.createComponent(App);
      await router.navigateByUrl(url);
      await fixture.whenStable();
      expect(router.parseUrl(router.url).queryParams['returnUrl']).toBe(url);
      expect(fixture.nativeElement.querySelector('app-not-found')).toBeNull();
      for (const [id, value] of [['username', 'demo@example.com'], ['password', '123456']]) {
        const input = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
        input.value = value;
        input.dispatchEvent(new Event('input'));
      }
      fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('app-not-found')).not.toBeNull();
      fixture.nativeElement.querySelector('app-not-found button').click();
      await fixture.whenStable();
      expect(router.url).toBe('/home');
      expect(fixture.nativeElement.querySelector('app-home')).not.toBeNull();
      fixture.destroy();
    });
});

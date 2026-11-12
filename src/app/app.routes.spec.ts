import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { Auth } from './service/auth/auth';

describe('Application routing', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('renders the protected home through the default redirect', async () => {
    TestBed.inject(Auth).login({ email: 'demo@example.com', password: '123456' });
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(TestBed.inject(Router).url).toBe('/home');
    expect(root.querySelector('app-home h1')?.textContent).toBe('首頁');
    expect(root.querySelector('app-home header')?.textContent).toContain('測試使用者');
    expect(root.querySelectorAll('app-home [aria-disabled="true"]').length).toBe(10);
    expect(root.querySelector('app-home a, app-home button')).toBeNull();
  });

  it('preserves the requested URL and renders home after form login', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/home?tab=profile#details');
    await fixture.whenStable();
    expect(router.parseUrl(router.url).queryParams['returnUrl']).toBe('/home?tab=profile#details');
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('app-login')).not.toBeNull();
    expect(root.querySelector('app-nav nav')).toBeNull();
    for (const [id, value] of [['username', 'demo@example.com'], ['password', '123456']]) {
      const input = root.querySelector<HTMLInputElement>(`#${id}`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    expect(router.url).toBe('/home?tab=profile#details');
    expect(root.querySelector('app-home h1')?.textContent).toBe('首頁');
    expect(root.querySelector('app-nav nav')).not.toBeNull();
  });
});

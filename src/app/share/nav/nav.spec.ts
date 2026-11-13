import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from '../../app.routes';
import { Auth, AUTH_STORAGE_KEY } from '../../service/auth/auth';
import { Nav } from './nav';

describe('Nav', () => {
  let component: Nav;
  let fixture: ComponentFixture<Nav>;

  beforeEach(async () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    await TestBed.configureTestingModule({
      imports: [Nav],
      providers: [provideRouter(routes)],
    }).compileComponents();

    TestBed.inject(Auth).login({ email: 'demo@example.com', password: '123456' });
    fixture = TestBed.createComponent(Nav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => localStorage.removeItem(AUTH_STORAGE_KEY));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reacts to login and logout', async () => {
    const auth = TestBed.inject(Auth);
    auth.logout();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
    auth.login({ email: 'demo@example.com', password: '123456' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('nav')).not.toBeNull();
    auth.logout();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });

  it('toggles the desktop user card and closes it on outside clicks or Escape', () => {
    const originalWidth = window.innerWidth;
    try {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      const toggle = root.querySelector<HTMLButtonElement>('#nav-group-user')!;
      const actions = root.querySelector<HTMLElement>('#user-actions')!;
      expect(actions.hidden).toBe(true);
      toggle.click();
      fixture.detectChanges();
      expect(actions.hidden).toBe(false);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(root.querySelector('#nav-group-announcement_board')!.getAttribute('aria-expanded')).toBe('true');

      root.querySelector<HTMLElement>('.user-card')!.click();
      fixture.detectChanges();
      expect(actions.hidden).toBe(false);
      document.body.click();
      fixture.detectChanges();
      expect(actions.hidden).toBe(true);

      toggle.click();
      fixture.detectChanges();
      toggle.click();
      fixture.detectChanges();
      expect(actions.hidden).toBe(true);
      toggle.click();
      fixture.detectChanges();
      root.querySelector<HTMLButtonElement>('#nav-group-classInfo')!.click();
      fixture.detectChanges();
      expect(actions.hidden).toBe(true);

      toggle.click();
      fixture.detectChanges();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(actions.hidden).toBe(true);
      expect(document.activeElement).toBe(toggle);

      toggle.click();
      fixture.detectChanges();
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
      expect(actions.hidden).toBe(true);
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
      window.dispatchEvent(new Event('resize'));
    }
  });

  it('logs out from the expanded desktop user card', async () => {
    const originalWidth = window.innerWidth;
    try {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      root.querySelector<HTMLButtonElement>('#nav-group-user')!.click();
      fixture.detectChanges();
      root.querySelector<HTMLButtonElement>('.logout-button')!.click();
      await fixture.whenStable();
      expect(TestBed.inject(Auth).currentUser()).toBeNull();
      expect(TestBed.inject(Router).url).toBe('/login');
      expect(root.querySelector('.user-card')).toBeNull();
      TestBed.inject(Auth).login({ email: 'demo@example.com', password: '123456' });
      await fixture.whenStable();
      expect(root.querySelector<HTMLElement>('#user-actions')!.hidden).toBe(true);
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
      window.dispatchEvent(new Event('resize'));
    }
  });

  it('logs out from the mobile drawer and returns to login', async () => {
    const originalWidth = window.innerWidth;
    try {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
      const router = TestBed.inject(Router);
      await router.navigate(['/home']);
      const root = fixture.nativeElement as HTMLElement;
      root.querySelector<HTMLButtonElement>('.menu-toggle')!.click();
      fixture.detectChanges();
      const userGroup = root.querySelector<HTMLButtonElement>('#nav-group-user')!;
      const userActions = root.querySelector<HTMLElement>('#user-actions')!;
      expect(userActions.hidden).toBe(true);
      userGroup.click();
      fixture.detectChanges();
      expect(userActions.hidden).toBe(false);
      expect(root.querySelectorAll('.nav-group-label[aria-expanded="true"]').length).toBe(1);
      expect(root.querySelector<HTMLElement>('#nav-items-announcement_board')!.hidden).toBe(true);

      root.querySelector<HTMLButtonElement>('#nav-group-classInfo')!.click();
      fixture.detectChanges();
      expect(userActions.hidden).toBe(true);
      expect(userGroup.getAttribute('aria-expanded')).toBe('false');

      userGroup.click();
      fixture.detectChanges();
      root.querySelector<HTMLButtonElement>('.logout-button')!.click();
      await fixture.whenStable();

      expect(TestBed.inject(Auth).currentUser()).toBeNull();
      expect(router.url).toBe('/login');
      expect(root.querySelector('.nav-container')).toBeNull();

      TestBed.inject(Auth).login({ email: 'demo@example.com', password: '123456' });
      await fixture.whenStable();
      expect(root.querySelector('.sidebar')!.classList.contains('is-open')).toBe(false);
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
      window.dispatchEvent(new Event('resize'));
    }
  });

  it('disables all unfinished items and keeps home navigable', async () => {
    const root = fixture.nativeElement as HTMLElement;
    const disabled = root.querySelectorAll<HTMLElement>('.nav-disabled');
    expect(disabled.length).toBe(5);
    for (const item of disabled) {
      expect(item.getAttribute('aria-disabled')).toBe('true');
      expect(item.hasAttribute('href')).toBe(false);
      expect(item.querySelector('a, button, [tabindex]')).toBeNull();
      expect(item.textContent).toContain('尚未開放');
    }
    expect(root.querySelectorAll('a').length).toBe(1);
    root.querySelector<HTMLAnchorElement>('.home-link')!.click();
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/home');
    expect(root.querySelector('.home-link')?.getAttribute('aria-current')).toBe('page');
  });

  it('expands only one category and allows it to collapse', () => {
    const root = fixture.nativeElement as HTMLElement;
    const buttons = root.querySelectorAll<HTMLButtonElement>('.nav-group-label');
    buttons[1].click();
    fixture.detectChanges();
    expect(root.querySelectorAll('.nav-group-label[aria-expanded="true"]').length).toBe(1);
    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
    expect(root.querySelector<HTMLUListElement>('#nav-items-classInfo')?.hidden).toBe(false);
    buttons[1].click();
    fixture.detectChanges();
    expect(root.querySelectorAll('.nav-group-label[aria-expanded="true"]').length).toBe(0);
  });

  it('closes the drawer only when crossing the mobile breakpoint', () => {
    const originalWidth = window.innerWidth;
    const resize = (width: number) => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
    };
    try {
      resize(390);
      const root = fixture.nativeElement as HTMLElement;
      root.querySelector<HTMLButtonElement>('.menu-toggle')!.click();
      fixture.detectChanges();

      resize(500);
      expect(root.querySelector('.sidebar')!.classList.contains('is-open')).toBe(true);

      resize(768);
      expect(root.querySelector('.sidebar')!.classList.contains('is-open')).toBe(false);

      resize(390);
      expect(root.querySelector('.sidebar')!.hasAttribute('inert')).toBe(true);
    } finally {
      resize(originalWidth);
    }
  });

  it('opens the mobile drawer and closes it with Escape or the backdrop', () => {
    const originalWidth = window.innerWidth;
    try {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      const toggle = root.querySelector<HTMLButtonElement>('.menu-toggle')!;
      const sidebar = root.querySelector<HTMLElement>('.sidebar')!;
      expect(sidebar.hasAttribute('inert')).toBe(true);
      toggle.click();
      fixture.detectChanges();
      expect(sidebar.classList.contains('is-open')).toBe(true);
      expect(sidebar.hasAttribute('inert')).toBe(false);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(sidebar.classList.contains('is-open')).toBe(false);
      toggle.click();
      fixture.detectChanges();
      root.querySelector<HTMLButtonElement>('.menu-backdrop')!.click();
      fixture.detectChanges();
      expect(sidebar.hasAttribute('inert')).toBe(true);
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
      window.dispatchEvent(new Event('resize'));
    }
  });
});

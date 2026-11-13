import { TestBed } from '@angular/core/testing';
import { routes } from '../../app.routes';
import { authGuard, guestGuard, permissionGuard } from '../auth/auth.guard';
import { Auth, AUTH_STORAGE_KEY } from '../auth/auth';
import { PageService } from './page';

describe('PageService', () => {
  let service: PageService;

  beforeEach(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    TestBed.configureTestingModule({});
    TestBed.inject(Auth).login({ email: 'demo2', password: '114514' });
    service = TestBed.inject(PageService);
  });

  afterEach(() => localStorage.removeItem(AUTH_STORAGE_KEY));

  it('keeps home and login available without exposing login in feature groups', () => {
    expect(service.homeLink).toEqual({ kind: 'link', label: '首頁', link: '/home' });
    expect(service.getUrl('home')).toBe('/home');
    expect(service.getUrl('login')).toBe('/login');
    expect(Object.values(service.navGroups()).flatMap(group => group.items).some(item => item.label === '登入')).toBe(false);
  });

  it('keeps unfinished features visible but unavailable for navigation or routing', () => {
    const features = Object.values(service.navGroups()).flatMap(group => group.items);
    expect(features.length).toBe(10);
    expect(features.every(item => item.kind === 'disabled')).toBe(true);
    expect(service.getUrl('broadcasts')).toBeNull();
    expect(Object.keys(service.navGroups())).toEqual([
      'announcement_board', 'classInfo', 'adminOnly', 'announcement', 'help_me',
    ]);
    expect(service.navGroups()['announcement'].items.map(item => item.label)).toEqual([
      '廣播列表', '本週稽核', '上週稽核', '上週廣播查詢',
    ]);
    expect(routes.filter(route => route.loadComponent && route.path !== '**').length).toBe(3);
  });

  it('keeps registered routes, navigation URLs and access restrictions consistent', () => {
    const urls = new Set<string>();
    for (const [id, page] of Object.entries(service.pages)) {
      if (page.kind !== 'link') continue;
      const route = routes.find(route => route.path === page.path)!;
      expect(route).toBeDefined();
      expect(route.title).toBe(page.label);
      expect(route.loadComponent).toBe(page.loadComponent);
      expect(route.canActivate).toEqual(page.access === 'guest' ? [guestGuard] : [authGuard, permissionGuard]);
      const url = service.getUrl(id as keyof typeof service.pages)!;
      expect(urls.has(url)).toBe(false);
      urls.add(url);
    }
    expect(urls.has(service.homeUrl)).toBe(true);
    expect(urls.has(service.loginUrl)).toBe(true);
    expect(routes.find(route => route.path === '')?.redirectTo).toBe(service.homeUrl);
    expect(routes.find(route => route.path === '**')?.canActivate).toEqual([authGuard]);
    expect(routes.find(route => route.path === '**')?.loadComponent).toBe(service.pages.notFound.loadComponent);
  });

  it('reacts to account changes and removes inaccessible entries and empty groups', () => {
    const auth = TestBed.inject(Auth);
    expect(service.navGroups()['adminOnly']).toBeDefined();
    auth.login({ email: 'demo@example.com', password: '123456' });
    expect(Object.values(service.navGroups()).flatMap(group => group.items).length).toBe(5);
    expect(service.navGroups()['adminOnly']).toBeUndefined();
    expect(service.navGroups()['help_me']).toBeUndefined();
    expect(service.navGroups()['announcement'].items.map(item => item.label)).toEqual(['廣播列表', '上週廣播查詢']);
    auth.logout();
    expect(service.navGroups()).toEqual({});
    expect(service.getUrl('home')).toBeNull();
  });
});

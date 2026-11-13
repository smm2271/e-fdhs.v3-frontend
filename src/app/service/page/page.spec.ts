import { TestBed } from '@angular/core/testing';
import { routes } from '../../app.routes';
import { authGuard, guestGuard } from '../auth/auth.guard';
import { PageService } from './page';

describe('PageService', () => {
  let service: PageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageService);
  });

  it('keeps home and login available without exposing login in feature groups', () => {
    expect(service.homeLink).toEqual({ kind: 'link', label: '首頁', link: '/home' });
    expect(service.getUrl('home')).toBe('/home');
    expect(service.getUrl('login')).toBe('/login');
    expect(Object.values(service.navGroups).flatMap(group => group.items).some(item => item.label === '登入')).toBe(false);
  });

  it('keeps unfinished features visible but unavailable for navigation or routing', () => {
    const features = Object.values(service.navGroups).flatMap(group => group.items);
    expect(features.length).toBe(10);
    expect(features.every(item => item.kind === 'disabled')).toBe(true);
    expect(service.getUrl('broadcasts')).toBeNull();
    expect(Object.keys(service.navGroups)).toEqual([
      'announcement_board', 'classInfo', 'adminOnly', 'announcement', 'help_me',
    ]);
    expect(service.navGroups['announcement'].items.map(item => item.label)).toEqual([
      '廣播列表', '本週稽核', '上週稽核', '上週廣播查詢',
    ]);
    expect(routes.filter(route => route.loadComponent).length).toBe(2);
  });

  it('keeps registered routes, navigation URLs and access restrictions consistent', () => {
    const urls = new Set<string>();
    for (const [id, page] of Object.entries(service.pages)) {
      if (page.kind !== 'link') continue;
      const route = routes.find(route => route.path === page.path)!;
      expect(route).toBeDefined();
      expect(route.title).toBe(page.label);
      expect(route.loadComponent).toBe(page.loadComponent);
      expect(route.canActivate).toEqual([page.access === 'guest' ? guestGuard : authGuard]);
      const url = service.getUrl(id as keyof typeof service.pages)!;
      expect(urls.has(url)).toBe(false);
      urls.add(url);
    }
    expect(urls.has(service.homeUrl)).toBe(true);
    expect(urls.has(service.loginUrl)).toBe(true);
    expect(routes.find(route => route.path === '')?.redirectTo).toBe(service.homeUrl);
    expect(routes.find(route => route.path === '**')?.redirectTo).toBe(service.homeUrl);
  });
});

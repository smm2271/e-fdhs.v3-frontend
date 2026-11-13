import { TestBed } from '@angular/core/testing';
import { Auth, AUTH_STORAGE_KEY } from './auth';

describe('Auth', () => {
  let service: Auth;

  beforeEach(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    TestBed.configureTestingModule({});
    service = TestBed.inject(Auth);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem(AUTH_STORAGE_KEY);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should log in with the mock account without exposing its password', () => {
    expect(service.login({ email: 'demo@example.com', password: '123456' })).toBe(true);
    expect(service.currentUser()).toEqual({
      id: '1',
      name: '測試使用者',
      email: 'demo@example.com',
      groupIds: ['student'],
    });
    expect(service.isAuthenticated()).toBe(true);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe('1');
  });

  it('should reject invalid credentials', () => {
    expect(service.login({ email: 'demo@example.com', password: 'wrong' })).toBe(false);
    expect(service.login({ email: 'unknown@example.com', password: '123456' })).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should clear the user on logout', () => {
    service.login({ email: 'demo@example.com', password: '123456' });
    service.logout();

    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(new Auth().isAuthenticated()).toBe(false);
  });

  it('restores the current mock account synchronously after a reload', () => {
    service.login({ email: 'demo2', password: '114514' });

    const restored = new Auth();

    expect(restored.currentUser()).toEqual(service.currentUser());
    expect(restored.isAuthenticated()).toBe(true);
    expect(restored.currentUser()).not.toHaveProperty('password');
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe('2');
  });

  it('discards an unknown stored account', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, 'unknown-user');

    expect(new Auth().currentUser()).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('continues working when browser storage is unavailable', () => {
    for (const method of ['getItem', 'setItem', 'removeItem'] as const) {
      vi.spyOn(Storage.prototype, method).mockImplementation(() => {
        throw new DOMException('Storage unavailable', 'SecurityError');
      });
    }
    const auth = new Auth();
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.login({ email: 'demo@example.com', password: '123456' })).toBe(true);
    expect(auth.isAuthenticated()).toBe(true);
    expect(() => auth.logout()).not.toThrow();
    expect(auth.isAuthenticated()).toBe(false);
  });
});

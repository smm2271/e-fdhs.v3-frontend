import { TestBed } from '@angular/core/testing';
import { Auth } from './auth';

describe('Auth', () => {
  let service: Auth;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Auth);
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
    });
    expect(service.isAuthenticated()).toBe(true);
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
  });
});

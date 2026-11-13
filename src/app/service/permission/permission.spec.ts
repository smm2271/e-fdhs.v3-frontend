import { TestBed } from '@angular/core/testing';
import { Auth, AUTH_STORAGE_KEY } from '../auth/auth';
import { PermissionService } from './permission';

describe('PermissionService', () => {
  let auth: Auth;
  let permissions: PermissionService;
  beforeEach(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    TestBed.configureTestingModule({});
    auth = TestBed.inject(Auth);
    permissions = TestBed.inject(PermissionService);
  });
  afterEach(() => localStorage.removeItem(AUTH_STORAGE_KEY));

  it('requires authentication even for an unrestricted policy', () => {
    expect(permissions.canAccess()).toBe(false);
    expect(permissions.effectivePermissions().size).toBe(0);
    auth.login({ email: 'demo@example.com', password: '123456' });
    expect(permissions.canAccess()).toBe(true);
    expect(permissions.canAccess({ allowedGroupIds: [], anyPermissions: [] })).toBe(true);
  });

  it('requires both an allowed group and any one requested code', () => {
    auth.login({ email: 'demo@example.com', password: '123456' });
    expect(permissions.canAccess({ allowedGroupIds: ['staff', 'student'], anyPermissions: ['class.password.read', 'board.read'] })).toBe(true);
    expect(permissions.canAccess({ allowedGroupIds: ['staff'], anyPermissions: ['board.read'] })).toBe(false);
    expect(permissions.canAccess({ allowedGroupIds: ['student'], anyPermissions: ['class.password.read'] })).toBe(false);
    expect(permissions.canAccess({ anyPermissions: ['unknown'] })).toBe(false);
    expect(permissions.canAccess({ allowedGroupIds: ['unknown'] })).toBe(false);
  });

  it('takes the union of memberships and updates after login and logout', () => {
    auth.login({ email: 'demo@example.com', password: '123456' });
    expect(permissions.effectivePermissions().size).toBe(4);
    auth.login({ email: 'demo2', password: '114514' });
    expect(permissions.effectivePermissions().size).toBe(8);
    expect(permissions.canAccess({ allowedGroupIds: ['admin'], anyPermissions: ['class.password.read'] })).toBe(true);
    expect(permissions.canAccess({ anyPermissions: ['unregistered'] })).toBe(false);
    auth.logout();
    expect(permissions.canAccess({ anyPermissions: ['board.read'] })).toBe(false);
    expect(permissions.effectivePermissions().size).toBe(0);
  });
});

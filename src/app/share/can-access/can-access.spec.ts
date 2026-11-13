import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Auth, AUTH_STORAGE_KEY } from '../../service/auth/auth';
import type { AccessPolicy } from '../../service/permission/permission.model';
import { CanAccess } from './can-access';

@Component({ imports: [CanAccess], template: '<button *appCanAccess="policy()">受保護操作</button>' })
class TestHost {
  readonly policy = signal<AccessPolicy>({ anyPermissions: ['class.password.read'] });
}

describe('CanAccess', () => {
  beforeEach(() => localStorage.removeItem(AUTH_STORAGE_KEY));
  afterEach(() => localStorage.removeItem(AUTH_STORAGE_KEY));

  it('creates and destroys views when either the user or policy changes', async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    const fixture = TestBed.createComponent(TestHost);
    const auth = TestBed.inject(Auth);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    auth.login({ email: 'demo@example.com', password: '123456' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    auth.login({ email: 'demo2', password: '114514' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('button').length).toBe(1);
    fixture.componentInstance.policy.set({ allowedGroupIds: ['student'] });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    fixture.componentInstance.policy.set({ anyPermissions: ['board.read'] });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('button').length).toBe(1);
    auth.logout();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});

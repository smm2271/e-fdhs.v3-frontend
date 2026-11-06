import { computed, Injectable, signal } from '@angular/core';
import { MOCK_AUTH_ACCOUNTS } from './auth.mock';
import { AuthUser, LoginCredentials } from './auth.model';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly userState = signal<AuthUser | null>(null);

  readonly currentUser = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  // TODO: 串接 API 時，將 mock 帳號比對替換成登入請求。
  login(credentials: LoginCredentials): boolean {
    const account = MOCK_AUTH_ACCOUNTS.find(
      (account) =>
        account.user.email === credentials.email &&
        account.password === credentials.password,
    );

    if (!account) {
      return false;
    }

    this.userState.set({ ...account.user });
    return true;
  }

  logout(): void {
    this.userState.set(null);
  }
}

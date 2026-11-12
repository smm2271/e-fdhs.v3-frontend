import { computed, Injectable, signal } from '@angular/core';
import { MOCK_AUTH_ACCOUNTS } from './auth.mock';
import { AuthUser, LoginCredentials } from './auth.model';

export const AUTH_STORAGE_KEY = 'e-fdhs.auth.user-id';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly userState = signal<AuthUser | null>(this.restoreUser());

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
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, account.user.id);
    } catch {
      // 儲存空間不可用時，仍可在目前頁面登入。
    }
    return true;
  }

  logout(): void {
    this.userState.set(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // 儲存空間不可用時，仍清除目前頁面的登入狀態。
    }
  }

  private restoreUser(): AuthUser | null {
    try {
      // 僅還原 mock 帳號；正式串接時應改由後端驗證 session。
      const userId = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!userId) return null;
      const account = MOCK_AUTH_ACCOUNTS.find(account => account.user.id === userId);
      if (account) return { ...account.user };
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // 無法讀取或還原時，讓 guard 導向登入頁。
    }
    return null;
  }
}

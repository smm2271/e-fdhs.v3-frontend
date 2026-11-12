import { AuthUser } from './auth.model';

// 僅供開發測試，正式驗證應由後端處理。
export const MOCK_AUTH_ACCOUNTS: ReadonlyArray<{
  user: AuthUser;
  password: string;
}> = [
  {
    user: {
      id: '1',
      name: '測試使用者',
      email: 'demo@example.com',
    },
    password: '123456',
  },
  {
    user: {
      id: '2',
      name: '測試使用者2',
      email: 'demo2',
    },
    password: '114514',
  }
];

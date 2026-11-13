// 依專案需求擴充使用者欄位。
export interface AuthUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly groupIds: readonly string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

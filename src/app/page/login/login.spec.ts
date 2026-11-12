import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { Auth, AUTH_STORAGE_KEY } from '../../service/auth/auth';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => localStorage.removeItem(AUTH_STORAGE_KEY));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  async function submit(email: string, password: string): Promise<void> {
    const element = fixture.nativeElement as HTMLElement;
    for (const [id, value] of [['username', email], ['password', password]]) {
      const input = element.querySelector<HTMLInputElement>(`#${id}`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    element.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  it('should authenticate form credentials and navigate to home', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    await submit('demo@example.com', '123456');

    expect(TestBed.inject(Auth).isAuthenticated()).toBe(true);
    expect(navigate).toHaveBeenCalledWith('/home', { replaceUrl: true });
  });

  it('should display an error and stay on login for invalid credentials', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    await submit('demo@example.com', 'wrong');

    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('帳號或密碼錯誤');
    expect(TestBed.inject(Auth).isAuthenticated()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('should return to the requested page after authentication', async () => {
    vi.spyOn(TestBed.inject(ActivatedRoute).snapshot, 'queryParamMap', 'get')
      .mockReturnValue(convertToParamMap({ returnUrl: '/home?tab=profile' }));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    await submit('demo@example.com', '123456');

    expect(navigate).toHaveBeenCalledWith('/home?tab=profile', { replaceUrl: true });
  });

  it('should require both fields before attempting authentication', async () => {
    const login = vi.spyOn(TestBed.inject(Auth), 'login');

    await submit('', '');

    expect(login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('請輸入帳號與密碼');
  });

  it.each(['/login?returnUrl=/login', '//example.com', 'https://example.com'])
    ('uses home instead of an invalid return URL: %s', async (returnUrl) => {
      vi.spyOn(TestBed.inject(ActivatedRoute).snapshot, 'queryParamMap', 'get')
        .mockReturnValue(convertToParamMap({ returnUrl }));
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

      await submit('demo@example.com', '123456');

      expect(navigate).toHaveBeenCalledWith('/home', { replaceUrl: true });
    });
});

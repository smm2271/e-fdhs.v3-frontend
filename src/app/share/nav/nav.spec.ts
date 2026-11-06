import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Nav } from './nav';

describe('Nav', () => {
  let component: Nav;
  let fixture: ComponentFixture<Nav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nav],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Nav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('expands only one category and allows it to collapse', () => {
    const root = fixture.nativeElement as HTMLElement;
    const buttons = root.querySelectorAll<HTMLButtonElement>('.nav-group-label');
    buttons[1].click();
    fixture.detectChanges();
    expect(root.querySelectorAll('.nav-group-label[aria-expanded="true"]').length).toBe(1);
    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
    expect(root.querySelector<HTMLUListElement>('#nav-items-classInfo')?.hidden).toBe(false);
    buttons[1].click();
    fixture.detectChanges();
    expect(root.querySelectorAll('.nav-group-label[aria-expanded="true"]').length).toBe(0);
  });

  it('opens the mobile drawer and closes it with Escape or the backdrop', () => {
    const originalWidth = window.innerWidth;
    try {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      const toggle = root.querySelector<HTMLButtonElement>('.menu-toggle')!;
      const sidebar = root.querySelector<HTMLElement>('.sidebar')!;
      expect(sidebar.hasAttribute('inert')).toBe(true);
      toggle.click();
      fixture.detectChanges();
      expect(sidebar.classList.contains('is-open')).toBe(true);
      expect(sidebar.hasAttribute('inert')).toBe(false);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(sidebar.classList.contains('is-open')).toBe(false);
      toggle.click();
      fixture.detectChanges();
      root.querySelector<HTMLButtonElement>('.menu-backdrop')!.click();
      fixture.detectChanges();
      expect(sidebar.hasAttribute('inert')).toBe(true);
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
      window.dispatchEvent(new Event('resize'));
    }
  });
});

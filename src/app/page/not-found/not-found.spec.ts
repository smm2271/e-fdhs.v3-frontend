import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NotFound } from './not-found';

describe('NotFound', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({ imports: [NotFound], providers: [provideRouter([])] }).compileComponents();
  });
  afterEach(() => vi.useRealTimers());

  it('counts down for three seconds and replaces the URL with home', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(NotFound);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('404 error');
    expect(fixture.nativeElement.textContent).toContain('3 秒後');
    vi.advanceTimersByTime(2000);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('1 秒後');
    expect(navigate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/home', { replaceUrl: true });
    vi.advanceTimersByTime(5000);
    expect(navigate).toHaveBeenCalledTimes(1);
    fixture.destroy();
  });

  it('returns immediately and cancels the remaining timer', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(NotFound);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    vi.advanceTimersByTime(5000);
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/home', { replaceUrl: true });
    fixture.destroy();
  });

  it('does not navigate after the page is destroyed', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(NotFound);
    fixture.detectChanges();
    vi.advanceTimersByTime(1000);
    fixture.destroy();
    vi.advanceTimersByTime(5000);
    expect(navigate).not.toHaveBeenCalled();
  });
});

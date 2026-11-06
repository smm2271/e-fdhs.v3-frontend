import { TestBed } from '@angular/core/testing';
import { Viewport } from './viewport';

describe('Viewport', () => {
  const originalWidth = window.innerWidth;

  function resize(width: number): void {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
    window.dispatchEvent(new Event('resize'));
  }

  afterEach(() => {
    TestBed.resetTestingModule();
    resize(originalWidth);
  });

  it('uses the initial viewport width and shares one instance', () => {
    resize(390);
    const service = TestBed.inject(Viewport);

    expect(service.isMobile()).toBe(true);
    expect(TestBed.inject(Viewport)).toBe(service);
  });

  it('updates at the 768px breakpoint in both directions', () => {
    resize(768);
    const service = TestBed.inject(Viewport);
    expect(service.isMobile()).toBe(false);

    resize(767);
    expect(service.isMobile()).toBe(true);

    resize(768);
    expect(service.isMobile()).toBe(false);
  });

  it('removes the resize listener when destroyed', () => {
    resize(1024);
    const service = TestBed.inject(Viewport);
    TestBed.resetTestingModule();

    resize(390);
    expect(service.isMobile()).toBe(false);
  });
});

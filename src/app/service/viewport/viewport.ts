import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Viewport {
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly mobileState = signal(false);

  // 依視窗寬度判斷手機版，與 nav 的 CSS 斷點一致。
  readonly isMobile = this.mobileState.asReadonly();

  constructor() {
    const update = () => this.mobileState.set((this.window?.innerWidth ?? 768) < 768);
    update();
    this.window?.addEventListener('resize', update);
    inject(DestroyRef).onDestroy(() => this.window?.removeEventListener('resize', update));
  }
}

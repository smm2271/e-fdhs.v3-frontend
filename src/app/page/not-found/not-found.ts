import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PAGE_URLS } from '../../service/page/page.config';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  private readonly router = inject(Router);
  protected readonly secondsRemaining = signal(3);
  private readonly timer = setInterval(() => {
    this.secondsRemaining.update(seconds => seconds - 1);
    if (this.secondsRemaining() === 0) this.returnHome();
  }, 1000);

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
  }

  protected returnHome(): void {
    clearInterval(this.timer);
    void this.router.navigateByUrl(PAGE_URLS.home, { replaceUrl: true });
  }
}

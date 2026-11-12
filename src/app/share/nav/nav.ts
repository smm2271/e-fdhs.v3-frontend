import { KeyValuePipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { HOME_LINK, NAV_GROUPS } from './nav.model';
import { Auth } from '../../service/auth/auth';
import type { AuthUser } from '../../service/auth/auth.model';
import { Viewport } from '../../service/viewport/viewport';

@Component({
  imports: [KeyValuePipe, RouterLink, RouterLinkActive],
  selector: 'app-nav',
  styleUrl: './nav.scss',
  templateUrl: './nav.html',
  host: {
    '(document:keydown.escape)': 'closeMenu()',
  },
})
export class Nav {
  readonly auth = inject(Auth);
  protected readonly isMobile = inject(Viewport).isMobile;
  protected readonly menuOpen = signal(false);
  protected readonly expandedGroup = signal<string | null>('announcement_board');
  private readonly sidebar = viewChild<ElementRef<HTMLElement>>('sidebar');
  private readonly menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');

  constructor() {
    effect(() => {
      this.isMobile();
      untracked(() => this.closeMenu());
    });
  }

  protected toggleGroup(key: string): void {
    this.expandedGroup.update(current => current === key ? null : key);
  }

  protected user = computed<AuthUser | null>(() => this.auth.currentUser());

  protected openMenu(): void {
    this.menuOpen.set(true);
    requestAnimationFrame(() => {
      if (this.menuOpen()) {
        this.sidebar()?.nativeElement.querySelector<HTMLButtonElement>('button')?.focus();
      }
    });
  }

  protected closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (this.isMobile()) {
      requestAnimationFrame(() => {
        if (!this.menuOpen() && this.isMobile()) this.menuToggle()?.nativeElement.focus();
      });
    }
  }

  protected onMenuKeydown(event: KeyboardEvent): void {
    if (!this.isMobile() || !this.menuOpen() || event.key !== 'Tab') return;
    const controls = Array.from(
      this.sidebar()!.nativeElement.querySelectorAll<HTMLElement>('button, a[href]'),
    ).filter(element => !element.closest('[hidden]'));
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  protected readonly navStructure = NAV_GROUPS;
  protected readonly homeLink = HOME_LINK;
}

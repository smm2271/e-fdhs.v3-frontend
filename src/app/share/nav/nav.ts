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
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { PageService } from '../../service/page/page';
import { Auth } from '../../service/auth/auth';
import type { AuthUser } from '../../service/auth/auth.model';
import { Viewport } from '../../service/viewport/viewport';

@Component({
  imports: [KeyValuePipe, RouterLink, RouterLinkActive],
  selector: 'app-nav',
  styleUrl: './nav.scss',
  templateUrl: './nav.html',
  host: {
    '(document:keydown.escape)': 'onEscape()',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class Nav {
  readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly pages = inject(PageService);
  protected readonly isMobile = inject(Viewport).isMobile;
  protected readonly menuOpen = signal(false);
  protected readonly desktopUserOpen = signal(false);
  protected readonly expandedGroup = signal<string | null>('announcement_board');
  protected readonly userExpanded = computed(() => this.isMobile()
    ? this.expandedGroup() === 'user'
    : this.desktopUserOpen());
  private readonly userCard = viewChild<ElementRef<HTMLElement>>('userCard');
  private readonly userToggle = viewChild<ElementRef<HTMLButtonElement>>('userToggle');
  private readonly sidebar = viewChild<ElementRef<HTMLElement>>('sidebar');
  private readonly menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');

  constructor() {
    effect(() => {
      this.isMobile();
      this.auth.currentUser();
      untracked(() => {
        this.closeMenu();
        this.desktopUserOpen.set(false);
      });
    });
  }

  protected toggleGroup(key: string): void {
    this.expandedGroup.update(current => current === key ? null : key);
  }

  protected toggleUser(): void {
    if (this.isMobile()) {
      this.toggleGroup('user');
    } else {
      this.desktopUserOpen.update(open => !open);
    }
  }

  protected onDocumentClick(event: MouseEvent): void {
    const card = this.userCard()?.nativeElement;
    if (!this.isMobile() && this.desktopUserOpen() && card && !event.composedPath().includes(card)) {
      this.desktopUserOpen.set(false);
    }
  }

  protected onEscape(): void {
    if (this.desktopUserOpen()) {
      this.desktopUserOpen.set(false);
      this.userToggle()?.nativeElement.focus();
    }
    this.closeMenu();
  }

  protected user = computed<AuthUser | null>(() => this.auth.currentUser());

  protected logout(): void {
    this.closeMenu();
    this.desktopUserOpen.set(false);
    this.auth.logout();
    void this.router.navigateByUrl(this.pages.loginUrl, { replaceUrl: true });
  }

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
  protected readonly navStructure = this.pages.navGroups;
  protected readonly homeLink = this.pages.homeLink;
}

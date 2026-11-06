import { KeyValuePipe } from '@angular/common';
import { Component, effect, ElementRef, inject, signal, untracked, viewChild } from '@angular/core';
import { Viewport } from '../../service/viewport/viewport';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  protected navStructure = {
    announcement_board: {
      label: '首頁公布欄',
      items: [
        { label: '公布欄', link: '/list-announcement' }
      ]
    },
    classInfo: {
      label: '班級資訊',
      items: [
        { label: '生活榮譽競賽', link: '/honor' },
        { label: '勤學紀錄', link: '/studied-record' }
      ]
    },
    adminOnly: {
      label: '幹部專用',
      items: [
        { label: '班級密碼', link: '/home' }
      ]
    },
    announcement: {
      label: '校內廣播',
      items: [
        { label: '廣播列表', link: '/list-announcement' },
        { label: '本週稽核', link: '/weekly-audit' },
        { label: '上週稽核', link: '/last-week-audit' },
        { label: '上週廣播查詢', link: '/last-week-announcement' }
      ]
    },
    help_me: {
      label: '線上報修',
      items: [
        { label: '總務處報修', link: '/general-affairs' },
        { label: '電腦中心報修', link: '/computer-center' }
      ]
    }
  }
}

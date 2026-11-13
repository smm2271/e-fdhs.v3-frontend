import { Injectable } from '@angular/core';
import { PAGE_DEFINITIONS, PAGE_GROUPS, PAGE_URLS, PageId } from './page.config';
import type { PageDefinition, PageNavigationGroup, PageNavigationItem } from './page.model';

@Injectable({ providedIn: 'root' })
export class PageService {
  readonly pages = PAGE_DEFINITIONS;
  readonly homeUrl = PAGE_URLS.home;
  readonly loginUrl = PAGE_URLS.login;
  readonly homeLink: PageNavigationItem = {
    kind: 'link', label: this.pages.home.label, link: this.homeUrl,
  };
  readonly navGroups: Readonly<Record<string, PageNavigationGroup>> = Object.fromEntries(
    Object.entries(PAGE_GROUPS).map(([key, group]) => [key, {
      label: group.label,
      items: (Object.values(this.pages) as readonly PageDefinition[])
        .filter(page => page.group === key)
        .map((page): PageNavigationItem => page.kind === 'link'
          ? { kind: 'link', label: page.label, link: '/' + page.path }
          : { kind: 'disabled', label: page.label }),
    }]),
  );

  getUrl(id: PageId): string | null {
    const page = this.pages[id];
    return page.kind === 'link' ? '/' + page.path : null;
  }
}

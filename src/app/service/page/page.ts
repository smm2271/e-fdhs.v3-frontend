import { computed, inject, Injectable } from '@angular/core';
import { PAGE_DEFINITIONS, PAGE_GROUPS, PAGE_URLS, PageId } from './page.config';
import type { PageDefinition, PageNavigationGroup, PageNavigationItem } from './page.model';
import { PermissionService } from '../permission/permission';

@Injectable({ providedIn: 'root' })
export class PageService {
  private readonly permissions = inject(PermissionService);
  readonly pages = PAGE_DEFINITIONS;
  readonly homeUrl = PAGE_URLS.home;
  readonly loginUrl = PAGE_URLS.login;
  readonly homeLink: PageNavigationItem = {
    kind: 'link', label: this.pages.home.label, link: this.homeUrl,
  };
  readonly navGroups = computed<Readonly<Record<string, PageNavigationGroup>>>(() => Object.fromEntries(
    Object.entries(PAGE_GROUPS).map(([key, group]) => {
      const items = (Object.values(this.pages) as readonly PageDefinition[])
        .filter(page => page.group === key && this.permissions.canAccess(page.policy))
        .map((page): PageNavigationItem => page.kind === 'link'
          ? { kind: 'link', label: page.label, link: '/' + page.path }
          : { kind: 'disabled', label: page.label });
      return [key, { label: group.label, items }] as const;
    }).filter(([, group]) => group.items.length > 0),
  ));

  getUrl(id: PageId): string | null {
    const page: PageDefinition = this.pages[id];
    if (page.kind !== 'link') return null;
    const policy = page.policy;
    return page.access === 'guest' || this.permissions.canAccess(policy) ? '/' + page.path : null;
  }
}

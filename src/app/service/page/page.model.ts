import type { Route } from '@angular/router';

export type PageDefinition =
  | {
      readonly kind: 'link';
      readonly label: string;
      readonly path: string;
      readonly access: 'guest' | 'authenticated';
      readonly loadComponent: NonNullable<Route['loadComponent']>;
      readonly group?: string;
    }
  | {
      readonly kind: 'disabled';
      readonly label: string;
      readonly group: string;
    };

export type PageNavigationItem =
  | { readonly kind: 'link'; readonly label: string; readonly link: string }
  | { readonly kind: 'disabled'; readonly label: string };

export interface PageNavigationGroup {
  readonly label: string;
  readonly items: readonly PageNavigationItem[];
}

import { PRIMARY_OUTLET, Router } from '@angular/router';
import { PAGE_DEFINITIONS, PAGE_URLS } from '../page/page.config';

export function getLoginDestination(router: Router, returnUrl: string | null): string {
  if (!returnUrl?.startsWith('/') || returnUrl.startsWith('//') || /[\\\s]/.test(returnUrl)) {
    return PAGE_URLS.home;
  }

  const url = router.parseUrl(returnUrl);
  const firstSegment = url.root.children[PRIMARY_OUTLET]?.segments[0]?.path;
  if (!firstSegment || firstSegment === PAGE_DEFINITIONS.login.path) return PAGE_URLS.home;

  return router.serializeUrl(url);
}

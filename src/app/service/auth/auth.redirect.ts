import { PRIMARY_OUTLET, Router } from '@angular/router';

export function getLoginDestination(router: Router, returnUrl: string | null): string {
  if (!returnUrl?.startsWith('/') || returnUrl.startsWith('//') || /[\\\s]/.test(returnUrl)) {
    return '/home';
  }

  const url = router.parseUrl(returnUrl);
  const firstSegment = url.root.children[PRIMARY_OUTLET]?.segments[0]?.path;
  if (!firstSegment || firstSegment === 'login') return '/home';

  return router.serializeUrl(url);
}

import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { PERMISSION_CONFIG } from './service/permission/permission.config';
import { validatePermissionConfiguration } from './service/permission/permission.validation';
import { MOCK_AUTH_ACCOUNTS } from './service/auth/auth.mock';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => validatePermissionConfiguration(PERMISSION_CONFIG, MOCK_AUTH_ACCOUNTS)),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};

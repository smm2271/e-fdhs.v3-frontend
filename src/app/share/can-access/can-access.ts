import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionService } from '../../service/permission/permission';
import type { AccessPolicy } from '../../service/permission/permission.model';

@Directive({ selector: '[appCanAccess]' })
export class CanAccess {
  readonly appCanAccess = input.required<AccessPolicy>();
  private readonly permissions = inject(PermissionService);
  private readonly template = inject(TemplateRef<unknown>);
  private readonly container = inject(ViewContainerRef);
  private rendered = false;

  constructor() {
    effect(() => {
      const allowed = this.permissions.canAccess(this.appCanAccess());
      if (allowed && !this.rendered) this.container.createEmbeddedView(this.template);
      if (!allowed && this.rendered) this.container.clear();
      this.rendered = allowed;
    });
  }
}

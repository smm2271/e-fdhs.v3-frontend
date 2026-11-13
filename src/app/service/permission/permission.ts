import { computed, inject, Injectable } from '@angular/core';
import { Auth } from '../auth/auth';
import { PERMISSION_CONFIG } from './permission.config';
import type { AccessPolicy } from './permission.model';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly auth = inject(Auth);
  readonly effectivePermissions = computed<ReadonlySet<string>>(() => {
    const groups = this.auth.currentUser()?.groupIds ?? [];
    return new Set(groups.flatMap(id => Object.hasOwn(PERMISSION_CONFIG.groups, id)
      ? PERMISSION_CONFIG.groups[id].permissions : []));
  });

  canAccess(policy: AccessPolicy = {}): boolean {
    const user = this.auth.currentUser();
    if (!user) return false;
    if (user.groupIds.some(id => !Object.hasOwn(PERMISSION_CONFIG.groups, id))) return false;
    if (PERMISSION_CONFIG.exclusiveGroupPairs.some(([a, b]) => user.groupIds.includes(a) && user.groupIds.includes(b))) return false;
    const groupAllowed = !policy.allowedGroupIds?.length || policy.allowedGroupIds.some(id => user.groupIds.includes(id));
    const permissionAllowed = !policy.anyPermissions?.length || policy.anyPermissions.some(code => this.effectivePermissions().has(code));
    return groupAllowed && permissionAllowed;
  }
}

export interface AccessPolicy {
  readonly allowedGroupIds?: readonly string[];
  readonly anyPermissions?: readonly string[];
}

export interface PermissionConfig {
  readonly permissions: Readonly<Record<string, string>>;
  readonly groups: Readonly<Record<string, {
    readonly label: string;
    readonly permissions: readonly string[];
  }>>;
  readonly exclusiveGroupPairs: readonly (readonly [string, string])[];
}

import type { PermissionConfig } from './permission.model';

interface GroupMember {
  readonly user: { readonly id: string; readonly groupIds: readonly string[] };
}

// 純函式，由建置前腳本與 Angular 初始化共用，不依賴 Angular 或瀏覽器。
export function validatePermissionConfiguration(config: PermissionConfig, accounts: readonly GroupMember[]): void {
  const errors: string[] = [];
  const hasGroup = (id: string) => Object.hasOwn(config.groups, id);
  for (const [id, group] of Object.entries(config.groups)) {
    if (!id.trim() || !group.label?.trim() || !Array.isArray(group.permissions)) {
      errors.push(`groups.${id}: 身分組需要名稱與權限碼陣列`);
      continue;
    }
    for (const code of group.permissions) {
      if (!Object.hasOwn(config.permissions, code)) errors.push(`groups.${id}: 未知權限碼 ${code}`);
    }
  }
  const pairs = new Set<string>();
  for (const [index, pair] of config.exclusiveGroupPairs.entries()) {
    if (!Array.isArray(pair) || pair.length !== 2 || pair.some(id => typeof id !== 'string')) {
      errors.push(`exclusiveGroupPairs[${index}]: 必須包含兩個身分組 ID`);
      continue;
    }
    const [left, right] = pair;
    if (!hasGroup(left) || !hasGroup(right)) errors.push(`exclusiveGroupPairs[${index}]: 未知身分組 ${left} / ${right}`);
    if (left === right) errors.push(`exclusiveGroupPairs[${index}]: ${left} 不能與自身互斥`);
    const key = JSON.stringify([...pair].sort());
    if (pairs.has(key)) errors.push(`exclusiveGroupPairs[${index}]: 重複互斥配對 ${left} / ${right}`);
    pairs.add(key);
  }
  for (const { user } of accounts) {
    if (!Array.isArray(user.groupIds)) {
      errors.push(`帳號 ${user.id}: groupIds 必須為陣列`);
      continue;
    }
    const seen = new Set<string>();
    for (const id of user.groupIds) {
      if (!hasGroup(id)) errors.push(`帳號 ${user.id}: 未知身分組 ${id}`);
      if (seen.has(id)) errors.push(`帳號 ${user.id}: 重複身分組 ${id}`);
      seen.add(id);
    }
    for (const pair of config.exclusiveGroupPairs) {
      if (Array.isArray(pair) && pair.length === 2 && pair[0] !== pair[1] && seen.has(pair[0]) && seen.has(pair[1])) {
        errors.push(`帳號 ${user.id}: 身分組 ${pair[0]} 與 ${pair[1]} 互斥`);
      }
    }
  }
  if (errors.length) throw new Error(`權限設定錯誤：\n${errors.join('\n')}`);
}

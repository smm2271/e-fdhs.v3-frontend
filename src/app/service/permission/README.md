# 權限設定

- `permission.config.ts`：新增權限碼、身分組與 `exclusiveGroupPairs`。
- `../auth/auth.mock.ts`：以 `user.groupIds` 配置帳號身分組。
- `../page/page.config.ts`：以頁面的 `policy` 設定存取條件；nav 與首頁自動使用相同規則。

## 政策

```ts
policy: {
  allowedGroupIds: ['classOfficer', 'staff', 'admin'],
  anyPermissions: ['class.password.read'],
}
```

已登入者必須符合任一指定身分組，且具備任一指定權限碼。省略或空陣列代表沒有該項額外限制。權限取所有身分組的聯集，管理員沒有隱含全權。

元件內可 inject `PermissionService` 呼叫 `canAccess(policy)`，或將 standalone directive `CanAccess` 加入元件的 `imports`：

```html
<button *appCanAccess="{ anyPermissions: ['repair.general.create'] }">報修</button>
```

不符合政策時不建立該區塊；nav 和首頁會隱藏無權限入口及空分類。「尚未開放」與權限分別管理，有權限不代表功能已開放。

## 互斥與驗證

```ts
exclusiveGroupPairs: [
  ['student', 'staff'],
  // ['staff', 'classOfficer'], // 依需求新增
],
```

每對關係均為雙向，不需要再列反向配對。衝突的帳號、未知／重複身分組、無效配對及未登錄的組別權限碼會直接報錯，不會自動修正。

`npm run validate:permissions` 可單獨驗證；`npm run build`、`npm start`、`npm run watch` 會在執行前驗證，應用初始化也會再次驗證。開發中變更設定後重新載入即可生效。直接執行 `ng build` 不經過 npm 的驗證 hook。

目前為前端 mock，登入持久化只保存帳號 ID；身分與權限每次依目前設定還原。正式 API 的授權仍需由後端驗證。

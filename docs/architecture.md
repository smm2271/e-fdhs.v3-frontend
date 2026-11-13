# 開發架構

本文件描述目前程式行為；功能狀態以集中設定為準。新增功能需另建主題文件，修改既有行為則同步維護相關文件，詳見 [文件索引](README.md)。

## 共用版面與頁面元件

[App 模板](../src/app/app.html) 放置左側 `app-nav` 與右側 `main`；Angular Router 將目前頁面的元件載入 `router-outlet`。

[App 樣式](../src/app/app.scss) 使用左右 flex 排版及 `min-height: 100dvh`，目前沒有將右側 `main` 設定為固定視窗高度的獨立捲動容器。各頁面負責自己的內容與樣式。

桌面 nav 寬度為 260px，sidebar 使用 sticky 定位、`100dvh` 高度及獨立的垂直捲動。使用者資訊位於底部；點擊使用者卡片後，登出操作以向上浮出的彈窗呈現，點擊卡片外或按 Esc 收起。

手機版使用 fixed 抽屜，收合時不佔內容寬度；開啟時提供遮罩、焦點限制與 Esc 關閉。手機使用者區與功能分類共用展開狀態，同時只展開一組。

## 頁面設定與路由

[page.config.ts](../src/app/service/page/page.config.ts) 是頁面名稱、路徑、導覽分組、開放狀態及存取政策的集中來源。

- `PAGE_GROUPS` 定義導覽分類名稱與順序。
- `PAGE_DEFINITIONS` 定義各功能；`kind: 'link'` 代表已開放，需提供 `path`、`access` 與 `loadComponent`。
- `kind: 'disabled'` 的功能不產生可訪問路由；有權限的使用者仍會看到「尚未開放」。
- `policy` 可限制允許的身分組及權限碼；`group` 指定導覽分類，沒有 `group` 的頁面不加入功能分類列表。
- `PAGE_URLS` 從頁面設定衍生首頁、登入及 404 網址。

[app.routes.ts](../src/app/app.routes.ts) 從已開放頁面產生 lazy routes、頁面標題與存取 guard。根路徑導向首頁；未知路徑交由 wildcard route 處理。

[PageService](../src/app/service/page/page.ts) 提供 `pages`、`homeUrl`、`loginUrl`、`homeLink`、`navGroups` 與 `getUrl(id)`。nav 和首頁共用 `navGroups` computed signal，帳號變更時重新計算可見項目，隱藏無權限入口與空分類。`getUrl` 在功能未開放或已登入頁面不符合存取政策時回傳 `null`。

目前已開放的頁面為 `/login`、`/home` 及 `/404`。廣播、稽核、班級資訊及報修等功能仍為未開放；存在元件骨架或 mock 資料不代表該頁面已開放。

新增或開放頁面時：

1. 建立對應的 standalone 頁面元件與必要測試。
2. 在 `PAGE_DEFINITIONS` 新增或調整定義，指定 lazy loader、路徑、存取類型、導覽分類及必要政策。
3. 若需要新權限碼，先在權限 config 登錄並分配給身分組。
4. 驗證登入回跳、權限拒絕、nav 與首頁入口，並新增對應的 `docs` 功能文件及索引。

## 登入與持久化

[Auth](../src/app/service/auth/auth.ts) 目前以 mock 帳號比對進行登入，透過 `currentUser` 及 `isAuthenticated` signals 提供狀態。

登入成功後，localStorage 的 `e-fdhs.auth.user-id` 只保存帳號 ID。初始化時同步用該 ID 取得目前 mock 帳號資料及 `groupIds`，不從 localStorage 還原密碼、身分組或權限碼。未知 ID 會被清除；儲存空間不可用時，仍可使用目前頁面的登入狀態。登出會清除目前狀態及已儲存 ID。

[auth.guard.ts](../src/app/service/auth/auth.guard.ts) 管理導流：

- `authGuard` 將未登入者導向登入頁，使用 `returnUrl` 保留原網址、query 與 fragment。
- `guestGuard` 將已登入者從登入頁導回目標網址或首頁。
- `permissionGuard` 判斷已登入者的頁面政策，不符合時導向 `/404`。

登入頁使用 [auth.redirect.ts](../src/app/service/auth/auth.redirect.ts) 檢查回跳網址，拒絕外部網址及返回登入頁的循環，並以 `replaceUrl` 完成登入後導流。

## 身分組與權限

[permission.config.ts](../src/app/service/permission/permission.config.ts) 集中定義可用權限碼、身分組及 `exclusiveGroupPairs`；[auth.mock.ts](../src/app/service/auth/auth.mock.ts) 的 `user.groupIds` 分配帳號身分組。

目前身分組為學生、班級幹部、教職員及管理員。帳號可加入多組，權限碼取各組的聯集；管理員也依明確配置判定，沒有隱含全權。

[PermissionService](../src/app/service/permission/permission.ts) 提供 `effectivePermissions` computed signal 與 `canAccess(policy)`。頁面入口、路由與區塊渲染共用此判定：

| 政策欄位 | 規則 |
| --- | --- |
| `allowedGroupIds` | 帳號須符合其中任一身分組 |
| `anyPermissions` | 帳號須具備其中任一權限碼 |
| 兩者均有設定 | 兩項條件都必須成立 |
| 欄位省略或空陣列 | 沒有該項額外限制；`canAccess` 仍要求登入 |

元件可注入 `PermissionService`，或在 standalone 元件的 `imports` 加入 [CanAccess](../src/app/share/can-access/can-access.ts)，控制區塊是否建立：

```html
<button *appCanAccess="{ anyPermissions: ['repair.general.create'] }">報修</button>
```

互斥配對雙向生效，預設只有 `student` 與 `staff` 互斥。增減配對直接調整 config，同一帳號包含互斥組時直接報錯，不自動修正。驗證亦涵蓋未知／重複身分組、自身互斥、重複配對及組別引用未登錄的權限碼。

[共用驗證函式](../src/app/service/permission/permission.validation.ts) 不依賴 Angular，由建置前腳本與應用初始化共同使用。驗證失敗會阻止標準 npm 建置；詳細設定範例見 [權限設定操作說明](../src/app/service/permission/README.md)。

這些機制目前控制前端 mock 的路由與畫面。正式登入及 API 資料存取仍需後端驗證與授權。

## 404 與安全返回

[NotFound](../src/app/page/not-found/not-found.ts) 顯示共用 404 錯誤畫面、3 秒倒數與立即返回首頁按鈕。

- 已登入者訪問無權限的已開放頁面，導向 `/404`。
- 已登入者訪問未知網址，在原網址由 wildcard route 顯示相同錯誤元件。
- 未登入者訪問未知網址，先登入並保留原網址，再顯示 404。
- 倒數結束或按下按鈕，以 `replaceUrl` 返回首頁；按下按鈕或元件銷毀時取消計時器。

首頁與 404 頁目前沒有額外權限政策，供合法已登入帳號使用，避免返回首頁時循環導流。

## 響應式與驗證

[Viewport](../src/app/service/viewport/viewport.ts) 監聽 resize，以寬度小於 768px 判斷手機版，並提供唯讀 `isMobile` signal。調整 breakpoint 時需同步檢查 nav 樣式及相關測試。

開發、建置及測試請使用 [常用指令](README.md)。`prestart`、`prebuild`、`prewatch` 會驗證權限配置；`pretest` 另執行驗證腳本與 npm 建置流程測試。專案沒有設定端到端測試框架，UI 實際畫面檢查需依任務執行並回報結果。

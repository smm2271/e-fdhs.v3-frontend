# 專案文件

本資料夾保存功能及開發文件。Agent 的工作規範由根目錄 [AGENTS.md](../AGENTS.md) 定義。

## 文件索引

| 文件 | 內容 |
| --- | --- |
| [開發架構](architecture.md) | 共用版面、頁面管理、登入、權限、404 與響應式行為 |
| [權限設定操作說明](../src/app/service/permission/README.md) | 權限政策、身分組、互斥設定及區塊渲染範例 |

## 文件維護

- 完成新功能時，在本資料夾新增對應文件，使用清楚的主題檔名，例如 `feature-name.md`，並加入上方索引。
- 修改既有功能時，同步更新相關文件；若該功能尚無文件，補上功能文件與索引。
- 說明應與目前程式一致，涵蓋目前行為、操作方式及必要的設定、權限、限制與驗證方法。
- 架構或共用流程改變時，同步更新 [開發架構](architecture.md)。

## 常用指令

在 frontend 根目錄執行；首次使用先執行 `npm install` 安裝相依套件。

| 指令 | 用途及自動驗證 |
| --- | --- |
| `npm start` | 先驗證權限設定，再啟動開發伺服器，預設網址為 `http://localhost:4200/` |
| `npm run build` | 先驗證權限設定，再建立正式版產物至 `dist/frontend/` |
| `npm run watch` | 先驗證權限設定，再以 development 設定持續建置；不啟動開發伺服器 |
| `npm run validate:permissions` | 單獨驗證身分組、權限碼、互斥關係與 mock 帳號配置 |
| `npm run test:permissions` | 執行權限驗證腳本與 npm 建置流程測試 |
| `npm test -- --watch=false` | 先驗證權限設定、執行建置流程測試，再單次執行 Angular 測試 |

`npm test` 也會執行相同的前置驗證，之後交由 Angular 測試工具的預設監看設定處理。專案目前沒有設定端到端測試框架。

請使用上述 npm scripts，直接執行 `ng build`、`ng serve` 或 `ng test` 會略過 npm 的前置驗證。應用程式初始化時亦會驗證權限設定；watch 期間修改設定後，重新載入應用程式以套用與驗證新設定。

Windows PowerShell 若因執行原則無法載入 `npm.ps1`，可將指令中的 `npm` 改為 `npm.cmd`，例如 `npm.cmd run build`。

# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.5.

## 專案文件

- [Agent 開發規範](AGENTS.md)
- [文件索引與常用指令](docs/README.md)
- [開發架構](docs/architecture.md)

完成新功能時，須在 `docs/` 新增對應文件並更新索引；修改既有功能時，須同步更新相關文件，使文件與實際功能相符。

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
npm test -- --watch=false
```

## Running end-to-end tests

專案目前沒有設定端到端測試框架。執行 UI 驗證時，請依任務檢查桌面、手機及鍵盤操作，並回報實際檢查範圍。

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// 僅載入純 TypeScript 設定與驗證模組；不啟動 Angular，不執行頁面程式。
function loadConfigurationModule(relativePath) {
  const filename = path.resolve(process.cwd(), relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  loaded._compile(compiled.outputText, filename);
  return loaded.exports;
}

try {
  const { PERMISSION_CONFIG } = loadConfigurationModule('src/app/service/permission/permission.config.ts');
  const { MOCK_AUTH_ACCOUNTS } = loadConfigurationModule('src/app/service/auth/auth.mock.ts');
  const { validatePermissionConfiguration } = loadConfigurationModule('src/app/service/permission/permission.validation.ts');
  validatePermissionConfiguration(PERMISSION_CONFIG, MOCK_AUTH_ACCOUNTS);
  console.log('權限設定與帳號身分組驗證通過。');
} catch (error) {
  console.error(error instanceof Error ? error.message : '權限設定驗證失敗。');
  process.exitCode = 1;
}

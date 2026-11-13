const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const project = path.resolve(__dirname, '..');
const packageConfig = JSON.parse(fs.readFileSync(path.join(project, 'package.json'), 'utf8'));
const baseConfig = {
  permissions: { read: '閱讀' },
  groups: {
    student: { label: '學生', permissions: ['read'] },
    staff: { label: '教職員', permissions: ['read'] },
    admin: { label: '管理員', permissions: ['read'] },
  },
  exclusiveGroupPairs: [['student', 'staff']],
};

function withFixture(config, groupIds, run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'efdhs-permissions-'));
  try {
    for (const folder of ['scripts', 'src/app/service/permission', 'src/app/service/auth']) {
      fs.mkdirSync(path.join(root, folder), { recursive: true });
    }
    fs.copyFileSync(path.join(project, 'scripts/validate-permissions.cjs'), path.join(root, 'scripts/validate-permissions.cjs'));
    fs.copyFileSync(path.join(project, 'src/app/service/permission/permission.validation.ts'), path.join(root, 'src/app/service/permission/permission.validation.ts'));
    fs.writeFileSync(path.join(root, 'src/app/service/permission/permission.config.ts'), `export const PERMISSION_CONFIG = ${JSON.stringify(config)};`);
    fs.writeFileSync(path.join(root, 'src/app/service/auth/auth.mock.ts'), `export const MOCK_AUTH_ACCOUNTS = ${JSON.stringify([{user:{id:'fixture-account',groupIds},password:'do-not-log-this-password'}])};`);
    fs.writeFileSync(path.join(root, 'scripts/build-sentinel.cjs'), 'console.log("BUILD_STARTED");');
    // 保留產品的驗證與 prebuild 設定，只將昂貴的 Angular build 換成可觀察標記。
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ scripts: {
      'validate:permissions': packageConfig.scripts['validate:permissions'],
      prebuild: packageConfig.scripts.prebuild,
      build: 'node scripts/build-sentinel.cjs',
    } }));
    const execute = args => spawnSync(process.execPath, args, {
      cwd: root, encoding: 'utf8', timeout: 30000,
      env: { ...process.env, NODE_PATH: path.join(project, 'node_modules') },
    });
    run(execute);
  } finally {
    const target = path.resolve(root);
    if (!target.startsWith(path.resolve(os.tmpdir()) + path.sep) || !path.basename(target).startsWith('efdhs-permissions-')) {
      throw new Error('Unexpected temporary fixture directory');
    }
    fs.rmSync(target, { recursive: true, force: true });
  }
}

test('CLI accepts compatible memberships and rejects conflicting ones without leaking passwords', () => {
  withFixture(baseConfig, ['staff', 'admin'], execute => {
    const result = execute(['scripts/validate-permissions.cjs']);
    assert.equal(result.status, 0, result.stderr);
  });
  withFixture(baseConfig, ['staff', 'student'], execute => {
    const result = execute(['scripts/validate-permissions.cjs']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /fixture-account.*student.*staff/);
    assert.doesNotMatch(result.stderr, /do-not-log-this-password/);
  });
});

test('CLI rejects invalid group configuration and memberships', () => {
  const cases = [
    [{ ...baseConfig, exclusiveGroupPairs: [['unknown', 'staff']] }, ['student'], /未知身分組/],
    [{ ...baseConfig, exclusiveGroupPairs: [['student', 'student']] }, ['student'], /自身互斥/],
    [{ ...baseConfig, exclusiveGroupPairs: [['student', 'staff'], ['staff', 'student']] }, ['student'], /重複互斥配對/],
    [baseConfig, ['unknown'], /fixture-account.*未知身分組/],
    [baseConfig, ['student', 'student'], /fixture-account.*重複身分組/],
  ];
  for (const [config, groupIds, message] of cases) {
    withFixture(config, groupIds, execute => {
      const result = execute(['scripts/validate-permissions.cjs']);
      assert.equal(result.status, 1);
      assert.match(result.stderr, message);
    });
  }
});

test('npm build stops before its builder for conflicting users and proceeds for valid users', () => {
  const npmCli = process.env.npm_execpath;
  assert.ok(npmCli && fs.existsSync(npmCli), 'Run through npm run test:permissions');
  for (const [groupIds, valid] of [[['student', 'staff'], false], [['staff', 'admin'], true]]) {
    withFixture(baseConfig, groupIds, execute => {
      const result = execute([npmCli, 'run', 'build']);
      const output = result.stdout + result.stderr;
      assert.equal(result.status === 0, valid, output);
      assert.equal(output.includes('BUILD_STARTED'), valid, output);
      if (!valid) assert.match(output, /fixture-account.*student.*staff/);
    });
  }
});

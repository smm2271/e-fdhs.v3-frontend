import { MOCK_AUTH_ACCOUNTS } from '../auth/auth.mock';
import { PERMISSION_CONFIG } from './permission.config';
import { validatePermissionConfiguration } from './permission.validation';

describe('permission configuration validation', () => {
  const member = (groupIds: string[]) => [{ user: { id: 'test-account', groupIds } }];

  it('accepts configured accounts and nonconflicting multiple memberships', () => {
    expect(() => validatePermissionConfiguration(PERMISSION_CONFIG, MOCK_AUTH_ACCOUNTS)).not.toThrow();
    expect(() => validatePermissionConfiguration(PERMISSION_CONFIG, member(['student', 'classOfficer']))).not.toThrow();
  });

  it.each([['student', 'staff'], ['staff', 'student']])('rejects conflicting memberships regardless of order: %s, %s', (a, b) => {
    expect(() => validatePermissionConfiguration(PERMISSION_CONFIG, member([a, b])))
      .toThrow(/test-account.*student.*staff/);
  });

  it('uses changes to configured pairs without hardcoded identity rules', () => {
    expect(() => validatePermissionConfiguration({ ...PERMISSION_CONFIG, exclusiveGroupPairs: [] }, member(['student', 'staff']))).not.toThrow();
    expect(() => validatePermissionConfiguration({ ...PERMISSION_CONFIG, exclusiveGroupPairs: [['admin', 'staff']] }, member(['staff', 'admin'])))
      .toThrow(/test-account.*admin.*staff/);
    expect(() => validatePermissionConfiguration({ ...PERMISSION_CONFIG, exclusiveGroupPairs: [['staff', 'student']] }, member(['staff', 'student'])))
      .toThrow(/test-account.*staff.*student/);
  });

  it.each([
    { pairs: [['unknown', 'staff']], message: /未知身分組/ },
    { pairs: [['student', 'student']], message: /自身互斥/ },
    { pairs: [['student', 'staff'], ['staff', 'student']], message: /重複互斥配對/ },
  ] as const)('rejects invalid exclusive configuration: $pairs', ({ pairs, message }) => {
    expect(() => validatePermissionConfiguration({ ...PERMISSION_CONFIG, exclusiveGroupPairs: pairs }, [])).toThrow(message);
  });

  it('rejects unknown or duplicate memberships with a useful account identifier', () => {
    expect(() => validatePermissionConfiguration(PERMISSION_CONFIG, member(['missing']))).toThrow(/test-account.*未知身分組 missing/);
    expect(() => validatePermissionConfiguration(PERMISSION_CONFIG, member(['student', 'student']))).toThrow(/test-account.*重複身分組 student/);
  });

  it('rejects an unregistered permission code', () => {
    expect(() => validatePermissionConfiguration({ ...PERMISSION_CONFIG, groups: { newGroup: { label: '新組別', permissions: ['typo.read'] } }, exclusiveGroupPairs: [] }, []))
      .toThrow(/newGroup.*typo.read/);
  });
});

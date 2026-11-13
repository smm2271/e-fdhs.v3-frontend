import type { PermissionConfig } from './permission.model';

// 身分組可直接增減；權限為各組的聯集，不提供管理員隱含繞過。
export const PERMISSION_CONFIG: PermissionConfig = {
  permissions: {
    'board.read': '閱讀公布欄',
    'class.honor.read': '查看生活榮譽競賽',
    'class.attendance.read': '查看勤學紀錄',
    'class.password.read': '查看班級密碼',
    'broadcast.read': '查看廣播',
    'broadcast.audit.read': '查看廣播稽核',
    'repair.general.create': '總務處報修',
    'repair.computer.create': '電腦中心報修',
  },
  groups: {
    student: {
      label: '學生',
      permissions: ['board.read', 'class.honor.read', 'class.attendance.read', 'broadcast.read'],
    },
    classOfficer: {
      label: '班級幹部',
      permissions: ['board.read', 'class.honor.read', 'class.attendance.read', 'broadcast.read',
        'class.password.read', 'broadcast.audit.read', 'repair.general.create', 'repair.computer.create'],
    },
    staff: {
      label: '教職員',
      permissions: ['board.read', 'class.honor.read', 'class.attendance.read', 'broadcast.read',
        'class.password.read', 'broadcast.audit.read', 'repair.general.create', 'repair.computer.create'],
    },
    admin: {
      label: '管理員',
      permissions: ['board.read', 'class.honor.read', 'class.attendance.read', 'broadcast.read',
        'class.password.read', 'broadcast.audit.read', 'repair.general.create', 'repair.computer.create'],
    },
  },
  // 每一對皆雙向互斥；例如要禁止教職員兼班級幹部，可加入 ['staff', 'classOfficer']。
  exclusiveGroupPairs: [['student', 'staff']],
};

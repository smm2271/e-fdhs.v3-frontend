import type { PageDefinition } from './page.model';

export const PAGE_GROUPS = {
  announcement_board: { label: '首頁公布欄' },
  classInfo: { label: '班級資訊' },
  adminOnly: { label: '幹部專用' },
  announcement: { label: '校內廣播' },
  help_me: { label: '線上報修' },
} as const;

// 頁面開放狀態、路徑、存取限制與導覽分類的唯一設定來源。
// 開放新頁面時，改為 link 並提供 path、access、loadComponent 即可。
export const PAGE_DEFINITIONS = {
  login: {
    kind: 'link', label: '登入', path: 'login', access: 'guest',
    loadComponent: () => import('../../page/login/login').then(module => module.Login),
  },
  home: {
    kind: 'link', label: '首頁', path: 'home', access: 'authenticated',
    loadComponent: () => import('../../page/home/home').then(module => module.Home),
  },
  notFound: {
    kind: 'link', label: '404 error', path: '404', access: 'authenticated',
    loadComponent: () => import('../../page/not-found/not-found').then(module => module.NotFound),
  },
  board: { kind: 'disabled', label: '公布欄', group: 'announcement_board', policy: { anyPermissions: ['board.read'] } },
  honor: { kind: 'disabled', label: '生活榮譽競賽', group: 'classInfo', policy: { anyPermissions: ['class.honor.read'] } },
  attendance: { kind: 'disabled', label: '勤學紀錄', group: 'classInfo', policy: { anyPermissions: ['class.attendance.read'] } },
  classPassword: { kind: 'disabled', label: '班級密碼', group: 'adminOnly', policy: {
    allowedGroupIds: ['classOfficer', 'staff', 'admin'], anyPermissions: ['class.password.read'],
  } },
  broadcasts: { kind: 'disabled', label: '廣播列表', group: 'announcement', policy: { anyPermissions: ['broadcast.read'] } },
  currentAudit: { kind: 'disabled', label: '本週稽核', group: 'announcement', policy: { anyPermissions: ['broadcast.audit.read'] } },
  previousAudit: { kind: 'disabled', label: '上週稽核', group: 'announcement', policy: { anyPermissions: ['broadcast.audit.read'] } },
  previousBroadcasts: { kind: 'disabled', label: '上週廣播查詢', group: 'announcement', policy: { anyPermissions: ['broadcast.read'] } },
  generalRepair: { kind: 'disabled', label: '總務處報修', group: 'help_me', policy: { anyPermissions: ['repair.general.create'] } },
  computerRepair: { kind: 'disabled', label: '電腦中心報修', group: 'help_me', policy: { anyPermissions: ['repair.computer.create'] } },
} as const satisfies Record<string, PageDefinition & { readonly group?: keyof typeof PAGE_GROUPS }>;

export type PageId = keyof typeof PAGE_DEFINITIONS;

export const PAGE_URLS = {
  home: '/' + PAGE_DEFINITIONS.home.path,
  login: '/' + PAGE_DEFINITIONS.login.path,
  notFound: '/' + PAGE_DEFINITIONS.notFound.path,
} as const;

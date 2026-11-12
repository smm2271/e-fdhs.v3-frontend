export type NavItem =
  | { label: string; kind: 'link'; link: string }
  | { label: string; kind: 'disabled' };

export interface NavGroup {
  label: string;
  items: readonly NavItem[];
}

export const NAV_GROUPS: Record<string, NavGroup> = {
  announcement_board: {
    label: '首頁公布欄',
    items: [{ label: '公布欄', kind: 'disabled' }],
  },
  classInfo: {
    label: '班級資訊',
    items: [
      { label: '生活榮譽競賽', kind: 'disabled' },
      { label: '勤學紀錄', kind: 'disabled' },
    ],
  },
  adminOnly: {
    label: '幹部專用',
    items: [{ label: '班級密碼', kind: 'disabled' }],
  },
  announcement: {
    label: '校內廣播',
    items: [
      { label: '廣播列表', kind: 'disabled' },
      { label: '本週稽核', kind: 'disabled' },
      { label: '上週稽核', kind: 'disabled' },
      { label: '上週廣播查詢', kind: 'disabled' },
    ],
  },
  help_me: {
    label: '線上報修',
    items: [
      { label: '總務處報修', kind: 'disabled' },
      { label: '電腦中心報修', kind: 'disabled' },
    ],
  },
};

export const HOME_LINK: NavItem = { label: '首頁', kind: 'link', link: '/home' };

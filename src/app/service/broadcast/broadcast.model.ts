export type BroadcastNoticeType = 'general' | 'announcement' | 'blackboard' | 'urgent';

export interface Broadcast {
  readonly id: string;
  readonly sourceNumber: number;
  readonly callerName: string;
  readonly callerRole: string;
  /** 原表僅提供月日，格式為 MM-DD，不推測年份。 */
  readonly date: string;
  /** 24 小時制，格式為 HH:mm。 */
  readonly time: string;
  /** 已假名化的純文字，保留換行與條列。 */
  readonly content: string;
  readonly noticeType: BroadcastNoticeType;
  readonly confirmationStatus: string;
  readonly confirmedBy: string;
  readonly checkInStatus: string | null;
  /** 僅記錄附件數量，不提供下載連結。 */
  readonly attachmentCount: number;
}

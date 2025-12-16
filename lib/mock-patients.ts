/**
 * モック患者データ（匿名化）
 *
 * 【重要】個人情報保護のため、氏名等の個人を特定できる情報は使用しない
 * 利用者の識別には匿名化ID（anonymousId）のみを使用する
 *
 * IDフォーマット: YY-NNN
 * - YY: 利用開始した西暦の下2桁（例: 25 = 2025年）
 * - NNN: 3桁の個別ID（001から開始、毎年1月1日にリセット）
 */

export interface MockPatient {
  /** 匿名化ID（YY-NNN形式） */
  id: string
}

/**
 * モック患者リスト（開発・テスト用）
 * 実際の運用では、データベースから取得する
 */
export const mockPatients: MockPatient[] = [
  { id: "25-001" },
  { id: "25-002" },
  { id: "25-003" },
  { id: "25-004" },
  { id: "25-005" },
]

/**
 * 患者IDが存在するか確認する
 */
export function isValidPatientId(patientId: string): boolean {
  return mockPatients.some((p) => p.id === patientId)
}

/**
 * デフォルトの患者IDを取得する
 */
export function getDefaultPatientId(): string {
  return mockPatients[0]?.id || "25-001"
}


/**
 * 匿名化ID（Anonymous ID）のユーティリティ関数
 *
 * IDフォーマット: YY-NNN
 * - YY: 利用開始した西暦の下2桁（例: 25 = 2025年）
 * - NNN: 3桁の個別ID（001から開始、毎年1月1日にリセット）
 *
 * 例: 25-022 = 2025年に利用開始した22番目の利用者
 */

/**
 * 匿名化IDの形式を表す正規表現パターン
 * YY-NNN形式（YY: 00-99, NNN: 001-999）
 */
export const ANONYMOUS_ID_PATTERN = /^(\d{2})-(\d{3})$/

/**
 * 匿名化IDの最小値と最大値
 */
export const ANONYMOUS_ID_SEQUENCE_MIN = 1
export const ANONYMOUS_ID_SEQUENCE_MAX = 999

/**
 * 匿名化IDの構成要素
 */
export interface AnonymousIdComponents {
  /** 利用開始年（西暦下2桁） */
  year: number
  /** 個別ID（1-999） */
  sequence: number
}

/**
 * 匿名化IDを生成する
 *
 * @param year - 利用開始年（西暦4桁または下2桁）
 * @param sequence - 個別ID（1-999）
 * @returns フォーマットされた匿名化ID（例: "25-022"）
 * @throws 無効なパラメータの場合はエラー
 */
export function generateAnonymousId(year: number, sequence: number): string {
  // 年の検証（4桁の場合は下2桁に変換）
  const yearTwoDigits = year > 99 ? year % 100 : year

  if (yearTwoDigits < 0 || yearTwoDigits > 99) {
    throw new Error(`無効な年: ${year}。0-99または2000-2099の範囲で指定してください。`)
  }

  // シーケンスの検証
  if (sequence < ANONYMOUS_ID_SEQUENCE_MIN || sequence > ANONYMOUS_ID_SEQUENCE_MAX) {
    throw new Error(
      `無効な個別ID: ${sequence}。${ANONYMOUS_ID_SEQUENCE_MIN}-${ANONYMOUS_ID_SEQUENCE_MAX}の範囲で指定してください。`
    )
  }

  // フォーマット: YY-NNN
  const yearStr = String(yearTwoDigits).padStart(2, "0")
  const sequenceStr = String(sequence).padStart(3, "0")

  return `${yearStr}-${sequenceStr}`
}

/**
 * 現在の年を基準に匿名化IDを生成する
 *
 * @param sequence - 個別ID（1-999）
 * @returns フォーマットされた匿名化ID
 */
export function generateAnonymousIdForCurrentYear(sequence: number): string {
  const currentYear = new Date().getFullYear()
  return generateAnonymousId(currentYear, sequence)
}

/**
 * 匿名化IDを検証する
 *
 * @param id - 検証する匿名化ID
 * @returns 有効な場合はtrue、無効な場合はfalse
 */
export function isValidAnonymousId(id: string): boolean {
  if (!id || typeof id !== "string") {
    return false
  }

  const match = id.match(ANONYMOUS_ID_PATTERN)
  if (!match) {
    return false
  }

  const sequence = parseInt(match[2], 10)
  return sequence >= ANONYMOUS_ID_SEQUENCE_MIN && sequence <= ANONYMOUS_ID_SEQUENCE_MAX
}

/**
 * 匿名化IDをパースして構成要素を取得する
 *
 * @param id - パースする匿名化ID
 * @returns 構成要素、または無効な場合はnull
 */
export function parseAnonymousId(id: string): AnonymousIdComponents | null {
  if (!isValidAnonymousId(id)) {
    return null
  }

  const match = id.match(ANONYMOUS_ID_PATTERN)
  if (!match) {
    return null
  }

  return {
    year: parseInt(match[1], 10),
    sequence: parseInt(match[2], 10),
  }
}

/**
 * 匿名化IDから利用開始年（西暦4桁）を取得する
 *
 * @param id - 匿名化ID
 * @param baseYear - 基準年（デフォルト: 2000）
 * @returns 西暦4桁の年、または無効な場合はnull
 */
export function getFullYearFromAnonymousId(id: string, baseYear: number = 2000): number | null {
  const components = parseAnonymousId(id)
  if (!components) {
    return null
  }

  return baseYear + components.year
}

/**
 * 匿名化IDを表示用にフォーマットする
 * （現在はそのまま返すが、将来的な表示形式変更に対応可能）
 *
 * @param id - 匿名化ID
 * @returns 表示用文字列
 */
export function formatAnonymousIdForDisplay(id: string): string {
  if (!isValidAnonymousId(id)) {
    return id // 無効な場合はそのまま返す
  }
  return id
}

/**
 * 匿名化IDを比較する（ソート用）
 * 年度順、その後シーケンス順でソート
 *
 * @param a - 比較対象A
 * @param b - 比較対象B
 * @returns 比較結果（-1, 0, 1）
 */
export function compareAnonymousIds(a: string, b: string): number {
  const componentsA = parseAnonymousId(a)
  const componentsB = parseAnonymousId(b)

  // 無効なIDは後ろに配置
  if (!componentsA && !componentsB) return 0
  if (!componentsA) return 1
  if (!componentsB) return -1

  // 年度で比較
  if (componentsA.year !== componentsB.year) {
    return componentsA.year - componentsB.year
  }

  // シーケンスで比較
  return componentsA.sequence - componentsB.sequence
}

/**
 * 次の匿名化IDを取得する
 *
 * @param currentId - 現在の匿名化ID
 * @returns 次の匿名化ID、または年が変わる場合は新年の001
 */
export function getNextAnonymousId(currentId: string): string {
  const components = parseAnonymousId(currentId)

  if (!components) {
    // 無効な場合は現在年の001から開始
    return generateAnonymousIdForCurrentYear(1)
  }

  const currentYear = new Date().getFullYear() % 100

  // 年が変わった場合は001から開始
  if (components.year !== currentYear) {
    return generateAnonymousId(currentYear, 1)
  }

  // 同じ年の場合は次のシーケンス
  const nextSequence = components.sequence + 1

  if (nextSequence > ANONYMOUS_ID_SEQUENCE_MAX) {
    throw new Error(
      `年間の最大登録数（${ANONYMOUS_ID_SEQUENCE_MAX}件）に達しました。`
    )
  }

  return generateAnonymousId(currentYear, nextSequence)
}


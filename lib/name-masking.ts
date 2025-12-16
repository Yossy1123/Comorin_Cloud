/**
 * 個人名マスキングユーティリティ
 * 
 * 会話テキストから個人名を検出してマスキングする機能を提供します。
 * 個人情報保護のため、敬称パターンを含む名前を検出して「***」に置換します。
 */

// マスキング用の置換文字
const MASK_STRING = "***"

// 敬称パターン（名前の後に付く敬称）
const HONORIFIC_SUFFIXES = [
  "さん",
  "くん",
  "君",
  "ちゃん",
  "様",
  "殿",
  "先生",
  "氏",
  "さま",
]

// 除外パターン（マスキングしない一般名詞）
const EXCLUDE_PATTERNS = ["支援者", "当事者", "担当者", "相談者", "利用者", "参加者", "対象者"]

/**
 * 日本語の名前に使われる文字かどうかをチェック
 * 漢字・ひらがな・カタカナを判定
 */
function isJapaneseNameChar(char: string): boolean {
  const code = char.charCodeAt(0)
  // CJK統合漢字 (4E00-9FFF)
  if (code >= 0x4E00 && code <= 0x9FFF) return true
  // CJK統合漢字拡張A (3400-4DBF)
  if (code >= 0x3400 && code <= 0x4DBF) return true
  // ひらがな (3040-309F)
  if (code >= 0x3040 && code <= 0x309F) return true
  // カタカナ (30A0-30FF)
  if (code >= 0x30A0 && code <= 0x30FF) return true
  // 々 (3005)
  if (code === 0x3005) return true
  // 長音記号 ー (30FC)
  if (code === 0x30FC) return true
  return false
}

/**
 * 連続する日本語名前文字を抽出
 */
function extractJapaneseNamePart(text: string, endIndex: number, maxLength: number = 5): string {
  let start = endIndex
  let count = 0
  
  while (start > 0 && count < maxLength) {
    const prevChar = text[start - 1]
    if (isJapaneseNameChar(prevChar)) {
      start--
      count++
    } else {
      break
    }
  }
  
  return text.substring(start, endIndex)
}

/**
 * 敬称パターンを使用して個人名を検出しマスキングする
 * 例: "田中さん" → "***さん", "山田先生" → "***先生"
 */
function maskNamesWithHonorifics(text: string): string {
  let result = text

  for (const suffix of HONORIFIC_SUFFIXES) {
    let searchIndex = 0
    let newResult = ""
    let lastIndex = 0
    
    while (true) {
      const suffixIndex = result.indexOf(suffix, searchIndex)
      if (suffixIndex === -1) break
      
      // 敬称の前の名前部分を取得
      const namePart = extractJapaneseNamePart(result, suffixIndex)
      
      if (namePart.length > 0) {
        // 除外パターンに該当するかチェック
        const shouldExclude = EXCLUDE_PATTERNS.some(
          exclude => namePart === exclude || namePart.endsWith(exclude)
        )
        
        if (!shouldExclude) {
          // マスキング対象
          newResult += result.substring(lastIndex, suffixIndex - namePart.length)
          newResult += MASK_STRING
          lastIndex = suffixIndex
        }
      }
      
      searchIndex = suffixIndex + suffix.length
    }
    
    // 残りの部分を追加
    if (lastIndex > 0) {
      newResult += result.substring(lastIndex)
      result = newResult
    }
  }

  return result
}

/**
 * 特定のコンテキストで名前として認識される表現をマスキング
 * 例: "氏名: 田中太郎" → "氏名: ***"
 */
function maskNameContextPatterns(text: string): string {
  const contextLabels = ["氏名", "名前", "お名前", "患者名", "利用者名", "対象者名"]
  let result = text
  
  for (const label of contextLabels) {
    const patterns = [`${label}:`, `${label}：`]
    
    for (const pattern of patterns) {
      let searchIndex = 0
      
      while (true) {
        const patternIndex = result.indexOf(pattern, searchIndex)
        if (patternIndex === -1) break
        
        const afterPattern = patternIndex + pattern.length
        
        // パターンの後のスペースをスキップ
        let nameStart = afterPattern
        while (nameStart < result.length && result[nameStart] === " ") {
          nameStart++
        }
        
        // 名前部分を検出（日本語文字が続く限り）
        let nameEnd = nameStart
        while (nameEnd < result.length && isJapaneseNameChar(result[nameEnd])) {
          nameEnd++
        }
        
        if (nameEnd > nameStart && nameEnd - nameStart >= 2 && nameEnd - nameStart <= 10) {
          // マスキング
          result = result.substring(0, nameStart) + MASK_STRING + result.substring(nameEnd)
        }
        
        searchIndex = afterPattern
      }
    }
  }
  
  return result
}

/**
 * 会話テキストから個人名をマスキングする
 * 
 * @param text - マスキング対象のテキスト
 * @returns マスキング後のテキスト
 * 
 * @example
 * ```ts
 * maskPersonalNames("田中さんと話しました")
 * // => "***さんと話しました"
 * 
 * maskPersonalNames("山田先生に相談しました")
 * // => "***先生に相談しました"
 * ```
 */
export function maskPersonalNames(text: string): string {
  if (!text) return text

  let result = text

  // Step 1: 敬称付きの名前をマスキング
  result = maskNamesWithHonorifics(result)

  // Step 2: コンテキストパターンでの名前をマスキング
  result = maskNameContextPatterns(result)

  return result
}

/**
 * マスキングが有効かどうかを判定
 * テキストに個人名が含まれている可能性があるかチェック
 * 
 * @param text - チェック対象のテキスト
 * @returns 個人名が含まれている可能性がある場合true
 */
export function hasPersonalNames(text: string): boolean {
  if (!text) return false

  for (const suffix of HONORIFIC_SUFFIXES) {
    let searchIndex = 0
    
    while (true) {
      const suffixIndex = text.indexOf(suffix, searchIndex)
      if (suffixIndex === -1) break
      
      const namePart = extractJapaneseNamePart(text, suffixIndex)
      
      if (namePart.length > 0) {
        const shouldExclude = EXCLUDE_PATTERNS.some(
          exclude => namePart === exclude
        )
        
        if (!shouldExclude) {
          return true
        }
      }
      
      searchIndex = suffixIndex + suffix.length
    }
  }

  return false
}

/**
 * テスト用: 検出された名前パターンを取得
 * 
 * @param text - チェック対象のテキスト
 * @returns 検出された名前パターンの配列
 */
export function detectPersonalNames(text: string): string[] {
  if (!text) return []

  const detected: string[] = []

  for (const suffix of HONORIFIC_SUFFIXES) {
    let searchIndex = 0
    
    while (true) {
      const suffixIndex = text.indexOf(suffix, searchIndex)
      if (suffixIndex === -1) break
      
      const namePart = extractJapaneseNamePart(text, suffixIndex)
      
      if (namePart.length > 0) {
        const shouldExclude = EXCLUDE_PATTERNS.some(
          exclude => namePart === exclude
        )
        
        if (!shouldExclude) {
          detected.push(namePart + suffix)
        }
      }
      
      searchIndex = suffixIndex + suffix.length
    }
  }

  return [...new Set(detected)]
}

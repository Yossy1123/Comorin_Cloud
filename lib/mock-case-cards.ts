// Mock case card database based on real hikikomori support cases

export interface CaseCard {
  id: string
  title: string
  source: string
  sourceUrl: string
  targetPerson: string
  background: string
  supportStart: string
  mainIntervention: string
  results: string
  reproducibleConditions: string
  risks: string
  kpi: string
  tags: string[]
}

export const caseCards: CaseCard[] = [
  {
    id: "case-001",
    title: "宮城県精神保健福祉センター による来所誘導・地域資源接続支援",
    source: "宮城県精神保健福祉センター「ひきこもり相談事例から支援を考える」",
    sourceUrl: "https://www.pref.miyagi.jp/documents/21961/301773_1.pdf",
    targetPerson: "26歳男性、ひきこもり歴約6年、自宅内にこもり、両親・祖父母と同居",
    background: "高校中退後、自宅中心の生活。人間関係不安・自責感、不眠・イライラ。親子間の関係性悪化。",
    supportStart: "本人と母親が来談、親の相談も並行。本人は支援に関心あり。",
    mainIntervention: "面談を重ね関係形成 → 地域のデイケアや居場所へ段階的参加促進 → 継続相談支援",
    results: "本人がデイケア参加 → 社会資源利用を始めるようになった",
    reproducibleConditions: "本人・家族の来談意欲、地域にデイケア等リソースがあること、支援者の関係形成力",
    risks: "関係未構築のままリソース紹介しても離脱の可能性あり",
    kpi: "来所回数／利用開始率／継続率",
    tags: ["関係構築", "地域資源接続", "中期介入", "デイケア", "家族支援"],
  },
  {
    id: "case-002",
    title: "青少年自立援助センターにおける家庭訪問から寮生活／就労定着までの支援",
    source: "青少年自立援助センター公式Webサイト「Aさん 19歳 男性」",
    sourceUrl: "https://www.npo-ysc.jp/case/a/",
    targetPerson: "19歳男性、高校1年で中退後、長期ひきこもり状態。家族との会話なし、外出なし",
    background: "日中は自室、夜のみ活動。家族とのコミュニケーション断絶。支援を始めづらい心理状態。",
    supportStart: "保護者への相談窓口対応 → 家庭訪問から開始",
    mainIntervention:
      "家庭訪問（約10回）で語りかけ・信頼関係構築 → 扉を開けてもらって初対面 → 入寮選択 → 寮で生活支援・学習支援 → 職場実習 → 卒寮・就職",
    results: "入寮後、認定試験合格・職場実習 → 卒寮・就職に至る",
    reproducibleConditions: "支援機関が入寮施設を持つ、当事者が寮受け入れ同意、支援体制整備",
    risks: "初期段階で無理強いしすぎると拒否される可能性。家族支援を並行すべき。",
    kpi: "入寮率／卒寮率／就労定着率",
    tags: ["訪問支援", "寮支援", "就労導入", "長期支援", "家族との関係断絶"],
  },
  {
    id: "case-003",
    title: "茨城県ひきこもり相談支援センターの長期化ケースへの段階的就労支援",
    source: "茨城県ひきこもり相談事例集",
    sourceUrl: "https://ibahiki.org/assets/soudanzirei.pdf",
    targetPerson: "大学卒業後 8年ひきこもり状態の成人男性",
    background: "社会との接点をほとんど持たず、自信喪失。進路希望・就労意欲不明瞭。",
    supportStart: "相談支援センターで継続面談開始、オンライン面談併用",
    mainIntervention: "就労支援機関（サポステなど）紹介 → 通所促進 → 職場体験 → 採用内諾 → 就労定着支援",
    results: "通所支援を開始 → 職場体験実績 → 採用内諾 → 就労スタート",
    reproducibleConditions: "就労支援機関との連携、本人の意思確認、段階導入余裕時間",
    risks: "通所開始が重荷になる可能性／モチベーション低下時の対応策設計必須",
    kpi: "通所開始率／体験参加率／採用内諾率／就労継続率",
    tags: ["長期ケース支援", "就労導入", "段階支援", "オンライン面談", "サポステ連携"],
  },
  {
    id: "case-004",
    title: "北海道「よりどころ 親の会」居場所支援事例",
    source: "厚生労働省「居場所づくりの実践事例集」より 「よりどころ 親の会」",
    sourceUrl: "https://hikikomori-voice-station.mhlw.go.jp/example/",
    targetPerson: "ひきこもり当事者およびその家族。形態は幅広く。",
    background: "家族も孤立しやすく、相談先・居場所がない → 当事者本人と家族双方の支援ニーズあり",
    supportStart: "親の会形式で居場所を提供。定期集まり／対話・交流、情報交換など。",
    mainIntervention: "親の会形式で居場所を提供。定期集まり／対話・交流、情報交換など。",
    results: "家族が相談できるネットワークができ、孤立軽減。当事者も参加を通じて関心を回復するケースあり",
    reproducibleConditions: "支援団体・NPOと行政・地域の協力関係、継続運営の資金、人員確保",
    risks: "参加者偏り（元気な人だけ来る）／居場所疲れ／過度な期待を生む可能性",
    kpi: "参加回数／継続率／家族・当事者の満足度／相談件数増加",
    tags: ["居場所支援", "家族支援", "交流拠点", "親の会", "孤立軽減"],
  },
  {
    id: "case-005",
    title: "京都府 メタバース空間を活用したオンライン居場所支援",
    source: "Web記事「京都府「メタバースを活用したオンライン居場所を開設」」",
    sourceUrl: "https://lipronext.com/knowledge/metaverse-hikikomori/",
    targetPerson: "家から出るのが困難な若年当事者（オンライン参加可能な層）",
    background: "対面居場所にアクセスできない／心理的なハードル高い当事者のための別チャネルが必要",
    supportStart: "メタバース空間上でアバターによる相談・交流・学習支援／ゲーム・クイズイベント／座談会",
    mainIntervention: "メタバース空間上でアバターによる相談・交流・学習支援／ゲーム・クイズイベント／座談会",
    results: "対面より低ハードルで交流が始まり、徐々に実世界での参加につながるケース期待",
    reproducibleConditions: "ICT環境（WiFi・PC端末）／運用ノウハウ／支援者の慣れ・モデレート体制",
    risks: "技術トラブル／匿名性ゆえのトラブル／実世界接続をどう橋渡しするかが課題",
    kpi: "オンライン参加者数／継続参加率／実世界参加への遷移率",
    tags: ["オンライン居場所", "低接触チャネル", "新技術応用", "メタバース", "若年層"],
  },
  {
    id: "case-006",
    title: "青少年自立援助センター Aさん（19歳男性）支援事例",
    source: "青少年自立援助センター公式サイト「Aさん 19歳 男性」",
    sourceUrl: "https://www.npo-ysc.jp/case/a/",
    targetPerson: "19歳男性。高校1年で中退後ひきこもり状態。家族との会話無し、外出無し。",
    background: "家庭内で無反応・閉じこもり状態。関係構築がゼロベース。",
    supportStart: "保護者相談 → 家庭訪問（約10回） → 語りかけ・待ち → 扉を開けてもらう → 初面談",
    mainIntervention:
      "保護者相談 → 家庭訪問（約10回） → 語りかけ・待ち → 扉を開けてもらう → 初面談 → 入寮へ本人判断 → 寮で支援 → 認定試験・職場実習 → 卒寮・就労",
    results: "寮生活を通じて社会適応力を獲得 → 就労・卒寮に至る",
    reproducibleConditions: "入寮施設がある／支援機関が寮運営能力／支援者の粘り強さ・関係構築能力",
    risks: "入寮が本人にとっても負担になる可能性／家族支援を怠ると抜けが生じる",
    kpi: "家庭訪問回数／入寮率／卒寮率／就労率",
    tags: ["訪問支援", "寮支援", "長期復帰支援", "粘り強い関係構築", "就労定着"],
  },
  {
    id: "case-007",
    title: "豊明市／市町村レベルでの地域との協働支援事例",
    source: "市町村におけるひきこもり支援事例（愛知県豊明市）",
    sourceUrl: "https://h-crisis.niph.go.jp/wp-content/uploads/2019/06/20190627103932_content_12000000_000519833.pdf",
    targetPerson: "地域で孤立している家族・当事者（具体年齢非記載）",
    background: "近隣との接点希薄、庭木伸び放題・挨拶もなしと苦情が地域から来るレベル",
    supportStart: "民生委員からの情報提供 → 地域包括支援・民生委員による訪問支援",
    mainIntervention:
      "民生委員からの情報提供 → 地域包括支援・民生委員による訪問支援 → 近隣住民との関係づくり（庭木剪定等）",
    results: "住環境改善・地域との接点が生まれ、支援・交流のきっかけができた",
    reproducibleConditions: "地域住民・民生委員との協働関係、地域資源（庭木剪定など）活用可能性",
    risks: "地域住民の反発、プライバシー問題、介入の押しつけ感",
    kpi: "訪問回数／地域関係改善指標／相談につながる割合",
    tags: ["地域協働", "訪問支援", "環境介入", "民生委員連携", "住環境改善"],
  },
  {
    id: "case-008",
    title: "茨城県 相談→医療保護入院を経て退院後支援を継続した事例",
    source: "ひきこもり相談対応事例集（茨城県）",
    sourceUrl: "https://ibahiki.org/assets/soudanzirei.pdf",
    targetPerson: "成人、長期ひきこもり状態、精神症状併存疑い",
    background: "通院中断、支援拒否状態、家族・本人双方のストレス増大",
    supportStart: "親からの相談 → 面談重ねる中で異常行動・幻聴報告あり → 医療介入必要と判断",
    mainIntervention: "医療保護入院 → 精神科治療 → 退院後は継続面談支援 → 就労支援機関紹介",
    results: "入院中の安定化 → 退院後外来通院継続 → 通所・就労支援への接続を模索中",
    reproducibleConditions: "医療機関との関係構築、継続支援体制、本人・家族の最低信頼関係",
    risks: "入院を無理強いすると拒否反発、退院後のフォロー切れ、病症再燃リスク",
    kpi: "入院日数／退院後通院継続率／支援接続率",
    tags: ["医療連携", "治療併用支援", "長期化対応", "精神症状", "入院治療"],
  },
  {
    id: "case-009",
    title: "愛知県における 8050／高年齢化ひきこもり事例と関係機関連携支援",
    source: "愛知県「ひきこもり事例分析 ― 長期化・高年齢化したケース支援」",
    sourceUrl: "https://www.pref.aichi.jp/uploaded/attachment/413953.pdf",
    targetPerson: "中年以降（40〜50代）長期化当事者、親も高齢・介護必要な環境含み",
    background: "複数課題（親の健康・介護／本人の孤立／経済困窮／支援拒否／住環境悪化）",
    supportStart: "保健所・医療機関・福祉相談支援事業所・地域包括連携で複数連携",
    mainIntervention: "定期訪問による信頼構築 → 受診勧奨 → 医療相談連携 → 福祉サービス調整 → 家族支援並行",
    results: "関係機関で情報共有→本人へのアプローチの方向性が明確になるケースあり",
    reproducibleConditions: "多機関連携体制、長期視点、信頼構築時間の確保",
    risks: "介護負担との兼ね合い、支援資源制約、当事者が変化を拒む局面",
    kpi: "定期訪問回数／医療受診率／サービス利用率",
    tags: ["高年齢化対応", "複合支援", "関係機関連携", "8050問題", "多機関協働"],
  },
  {
    id: "case-010",
    title: "東京都 アウトリーチ支援で医療・家族支援を含めた接近事例",
    source: "東京都アウトリーチ支援事業資料「ひきこもり事例へのアウトリーチ支援」",
    sourceUrl: "https://www.fukushi.metro.tokyo.lg.jp/documents/d/fukushi/06_3shiryo",
    targetPerson: "昼夜逆転／自室中心生活の成人ひきこもり者",
    background: "生活リズム逆転、衛生問題、ゴミ屋敷化、家族との関係悪化、医療ニーズ未把握",
    supportStart: "保健・福祉窓口・家族からの相談 → アウトリーチ開始",
    mainIntervention: "最小侵襲での訪問・対話 → 趣味／日常話題から関係構築 → 受診勧奨や診療案内 → 家族支援並行",
    results: "支援者と顔の見える関係が形成 → 家族も支援連携へ関わるようになるケース報告あり",
    reproducibleConditions: "担当者がアウトリーチ経験あること、医療／保健とのパイプ、支援者心理スキル",
    risks: "初期段階で医療や薬を押し付けると関係破綻、介入過多の印象を与えること",
    kpi: "訪問継続回数／対話成立率／受診開始率／家族参加率",
    tags: ["アウトリーチ支援", "医療促進", "家族支援併行", "昼夜逆転", "生活環境改善"],
  },
]

// Function to find similar cases based on analysis data
export function findSimilarCases(analysis: {
  riskLevel: string
  conversationInsights: { emotion: string; communication: string; stressLevel?: string }
  psychologicalState: Array<{ aspect: string; score: number }>
}): Array<{
  caseCard: CaseCard
  similarity: number
  matchingFactors: string[]
}> {
  const results: Array<{
    caseCard: CaseCard
    similarity: number
    matchingFactors: string[]
  }> = []

  // Analyze each case card for similarity
  for (const caseCard of caseCards) {
    let similarity = 0
    const matchingFactors: string[] = []

    // Check risk level match
    if (analysis.riskLevel === "高" && caseCard.tags.includes("長期化対応")) {
      similarity += 20
      matchingFactors.push("高リスク・長期化対応")
    }

    // Check communication issues
    if (
      analysis.conversationInsights.communication === "改善が必要" &&
      (caseCard.tags.includes("関係構築") || caseCard.tags.includes("訪問支援"))
    ) {
      similarity += 15
      matchingFactors.push("コミュニケーション課題")
    }

    // Check stress level from conversation insights
    if (
      analysis.conversationInsights.stressLevel === "高" &&
      (caseCard.tags.includes("医療連携") || caseCard.tags.includes("治療併用支援"))
    ) {
      similarity += 15
      matchingFactors.push("高ストレス状態")
    }

    // Check psychological state
    const lowSelfEsteem = analysis.psychologicalState.find((s) => s.aspect === "自己肯定感")
    if (lowSelfEsteem && lowSelfEsteem.score < 60 && caseCard.tags.includes("段階支援")) {
      similarity += 10
      matchingFactors.push("自己肯定感の低下")
    }

    // Check for family support needs
    if (analysis.conversationInsights.emotion === "不安" && caseCard.tags.includes("家族支援")) {
      similarity += 10
      matchingFactors.push("家族支援の必要性")
    }

    // Add some randomness for variety (±10%)
    similarity += Math.floor(Math.random() * 20) - 10

    // Ensure similarity is between 0-100
    similarity = Math.max(0, Math.min(100, similarity))

    if (similarity > 30) {
      // Only include cases with reasonable similarity
      results.push({
        caseCard,
        similarity,
        matchingFactors,
      })
    }
  }

  // Sort by similarity (descending) and return top 3
  return results.sort((a, b) => b.similarity - a.similarity).slice(0, 3)
}

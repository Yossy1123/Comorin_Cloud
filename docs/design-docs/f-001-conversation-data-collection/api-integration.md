# F-001: 外部API連携仕様

本ドキュメントは、会話データ収集機能（F-001）における外部API連携の詳細仕様を記載します。

**ステータス**: 🚧 作成中（Phase 3実装時に詳細化予定）

---

## 📋 概要

Phase 3において、以下の外部APIとの連携を実装します：

1. **Azure Speech Services** - 音声→テキスト変換
2. **OpenAI GPT-4 API** - 自然言語処理・感情分析

---

## 🎤 Azure Speech Services

### API概要

**用途**: 音声データをテキストに変換（Speech-to-Text）

**エンドポイント**: `https://<region>.api.cognitive.microsoft.com/sts/v1.0/issueToken`

**認証方式**: Subscription Key

### セットアップ手順（Phase 3実装予定）

```bash
# 環境変数設定
AZURE_SPEECH_KEY=your_subscription_key
AZURE_SPEECH_REGION=japaneast
```

### API仕様

#### 音声認識リクエスト

**リクエスト形式**:
```typescript
// 実装予定
```

**レスポンス形式**:
```json
// 実装予定
```

### エラーハンドリング

**エラーコード**:
- `RATE_LIMIT_EXCEEDED` - レート制限超過
- `LOW_CONFIDENCE` - 認識精度が低い
- `NETWORK_ERROR` - ネットワークエラー

**対応策**:
- 指数バックオフによるリトライ
- ユーザーへのフィードバック
- 手動テキスト入力へのフォールバック

### パフォーマンス目標

- レスポンス時間: 3秒以内
- 認識精度: 95%以上
- 信頼度スコア: 0.8以上

---

## 🤖 OpenAI GPT-4 API

### API概要

**用途**: 自然言語処理・感情分析・キーワード抽出

**エンドポイント**: `https://api.openai.com/v1/chat/completions`

**認証方式**: Bearer Token

### セットアップ手順（Phase 3実装予定）

```bash
# 環境変数設定
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4
```

### プロンプト設計

#### 感情分析プロンプト

```typescript
// Phase 3で実装予定
const analysisPrompt = `
以下の支援セッションの会話を分析してください。

【会話内容】
\${transcript}

【分析項目】
1. 感情状態（ポジティブ/ニュートラル/ネガティブ/不安）
2. ストレスレベル（低/中/高）
3. 重要なキーワード（5個以内）
4. 推奨される支援アプローチ

【出力形式】JSON
{
  "emotion": "string",
  "stressLevel": "string",
  "keywords": ["string"],
  "recommendation": "string"
}
`
```

### API仕様

#### リクエスト形式

```typescript
// 実装予定
```

#### レスポンス形式

```json
// 実装予定
```

### コスト最適化

**トークン制限**: 1リクエストあたり最大8,192トークン

**最適化戦略**:
- 長い会話の要約処理
- キャッシング戦略
- バッチ処理の検討

### パフォーマンス目標

- レスポンス時間: 5秒以内
- 分析精度: 90%以上
- 月間コスト上限: 設定予定

---

## 🔄 統合フロー

### 全体フロー（Phase 3実装予定）

```
┌──────────────┐
│ 音声録音      │
└──────┬───────┘
       │
       ▼
┌────────────────────────────┐
│ Azure Speech Services API  │
│ - 音声 → テキスト変換       │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│ OpenAI GPT-4 API           │
│ - 感情分析                  │
│ - キーワード抽出            │
│ - 支援アプローチ提案        │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│ Database 保存              │
└────────────────────────────┘
```

### エラー処理フロー

```
// Phase 3で詳細化予定
```

---

## 🧪 テスト計画

### 単体テスト

**Azure Speech Services**:
- [ ] 音声認識の正常系テスト
- [ ] エラーハンドリングテスト
- [ ] レート制限テスト

**OpenAI API**:
- [ ] 感情分析の正常系テスト
- [ ] プロンプトの妥当性テスト
- [ ] トークン制限テスト

### 統合テスト

- [ ] 音声録音→テキスト化→分析→保存のE2Eテスト
- [ ] エラーシナリオのテスト
- [ ] パフォーマンステスト

---

## 📊 モニタリング

### 監視項目

**Azure Speech Services**:
- API呼び出し回数
- エラー率
- 平均レスポンス時間
- 認識精度（信頼度スコア）

**OpenAI API**:
- API呼び出し回数
- トークン使用量
- エラー率
- 平均レスポンス時間
- 月間コスト

### アラート設定

- エラー率が5%を超えた場合
- レスポンス時間が目標値を超えた場合
- 月間コスト予算の80%に達した場合

---

## 📚 参考資料

### 公式ドキュメント

- [Azure Speech Services Documentation](https://learn.microsoft.com/ja-jp/azure/cognitive-services/speech-service/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/best-practices)

### 社内ドキュメント

- [README.md](./README.md) - 機能概要
- [implementation-notes.md](./implementation-notes.md) - 実装留意点
- [status.md](./status.md) - 実装状況

---

**最終更新**: 2025年10月16日  
**ステータス**: 骨格作成済み、Phase 3で詳細化予定  
**担当**: 開発チーム（2名体制）  
**実装予定**: Phase 3（Phase 2完了後、2-3ヶ月）


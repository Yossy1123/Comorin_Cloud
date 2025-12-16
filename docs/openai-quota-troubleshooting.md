# OpenAI API クォータエラー解決ガイド

## エラー内容

```
Error: 429 You exceeded your current quota, please check your plan and billing details.
```

このエラーは、OpenAI APIの使用制限を超えたことを示しています。

## 原因と解決方法

### 1. 無料クレジットの使い切り

**症状**: 新規アカウントで$5の無料クレジットを使い切った

**解決方法**:
1. [OpenAI Platform](https://platform.openai.com/) にログイン
2. 左メニューから「Settings」→「Billing」を開く
3. 現在の使用状況とクレジット残高を確認
4. 「Add payment method」をクリックしてクレジットカードを登録

### 2. 支払い情報の未設定

**症状**: クレジットカード情報が登録されていない

**解決方法**:
1. [Billing Settings](https://platform.openai.com/account/billing/overview) を開く
2. 「Payment methods」タブをクリック
3. 「Add payment method」でクレジットカード情報を登録
4. 「Billing preferences」で使用上限を設定（推奨: $10-50/月）

### 3. レート制限（Rate Limit）

**症状**: 短時間に多数のリクエストを送信した

**解決方法**:
- 数分待ってから再試行
- リクエスト頻度を下げる
- 本番環境では、キャッシング機能の実装を推奨

### 4. 月間使用上限に到達

**症状**: 設定した月間使用上限に達した

**解決方法**:
1. [Usage Limits](https://platform.openai.com/account/limits) を開く
2. 現在の使用状況を確認
3. 必要に応じて上限を引き上げる

## OpenAIアカウント設定手順

### ステップ1: ログインと確認

1. [OpenAI Platform](https://platform.openai.com/) にアクセス
2. アカウントにログイン
3. 左メニューから「Settings」→「Billing」を開く

### ステップ2: 請求情報の確認

**確認項目**:
- ✅ Payment method（支払い方法）が登録されているか
- ✅ Current balance（現在の残高）がプラスか
- ✅ Usage limits（使用制限）が適切か

### ステップ3: 支払い方法の追加

1. 「Payment methods」タブをクリック
2. 「Add payment method」をクリック
3. クレジットカード情報を入力：
   - カード番号
   - 有効期限
   - CVV（セキュリティコード）
   - 請求先住所
4. 「Add payment method」で保存

### ステップ4: 使用上限の設定（推奨）

予期しない高額請求を防ぐため、使用上限を設定することを強く推奨します。

1. 「Billing preferences」タブをクリック
2. 「Usage limits」セクションを探す
3. 「Hard limit」（絶対上限）を設定：
   - **開発・テスト環境**: $10-20/月
   - **小規模本番環境**: $50-100/月
   - **大規模本番環境**: 適宜設定
4. 「Soft limit」（警告閾値）も設定（Hard limitの50-80%程度）

### ステップ5: 使用状況のモニタリング

1. [Usage Dashboard](https://platform.openai.com/usage) を開く
2. 日次・月次の使用量を確認
3. コスト推移をチェック

## 暫定対応: GPT連携をOFFにする

OpenAIアカウントの設定が完了するまで、GPT連携をOFFにしてモックデータで動作確認を続けることができます。

### 方法

1. データ分析ページで当事者を選択
2. **「AI支援計画生成（GPT連携）」トグルをOFF**にする
3. 「個別支援計画」ボタンをクリック
4. モックデータを使用した支援計画が生成される

## 本番環境での推奨設定

### コスト管理

| 環境 | 推奨上限 | 想定使用量 | 備考 |
|------|---------|-----------|------|
| 開発 | $10/月 | ~$3-5/月 | テスト用途 |
| ステージング | $20/月 | ~$5-10/月 | 検証用途 |
| 本番（小規模） | $100/月 | ~$30-50/月 | 100-500件/月 |
| 本番（大規模） | $500/月 | ~$200-400/月 | 1000-5000件/月 |

### アラート設定

1. **Soft limit**: 予算の50%到達時にメール通知
2. **Hard limit**: 予算の80%で自動停止
3. **異常検知**: 1日の使用量が通常の3倍を超えた場合に通知

### キャッシング戦略

コスト削減のため、以下のキャッシング機能の実装を推奨：

```typescript
// 例: Redis/Memcachedを使用したキャッシング
const cacheKey = `support-plan-${patientId}-${dataHash}`;
const cached = await cache.get(cacheKey);

if (cached) {
  return cached; // キャッシュから返却
}

const plan = await generateSupportPlanWithGPT(patientId, patientName);
await cache.set(cacheKey, plan, { ttl: 3600 }); // 1時間キャッシュ

return plan;
```

## トラブルシューティング

### Q: クレジットカードを登録したが、まだエラーが出る

**A**: 設定が反映されるまで数分かかる場合があります。5-10分待ってから再試行してください。

### Q: 残高はあるのにエラーが出る

**A**: 以下を確認してください：
1. APIキーが正しいアカウントのものか
2. レート制限に引っかかっていないか（数分待つ）
3. 組織（Organization）の設定が正しいか

### Q: 開発中に頻繁にエラーが出る

**A**: レート制限の可能性があります。以下の対策を実施してください：
- リクエスト間隔を空ける
- キャッシング機能を実装する
- 開発中はGPT連携をOFFにする

### Q: エラーが解消されない

**A**: OpenAIサポートに問い合わせてください：
- サポートページ: https://help.openai.com/
- メール: support@openai.com
- エラーメッセージ、APIキー（一部マスク）、タイムスタンプを提供

## 代替案: モデルの変更

コストを抑えたい場合、より安価なモデルに変更することもできます。

`.env.local` に以下を追加：

```bash
# GPT-3.5 Turbo（約1/10のコスト）
OPENAI_MODEL=gpt-3.5-turbo
```

**トレードオフ**:
- ✅ コストが約1/10に削減
- ❌ 支援計画の質がやや低下する可能性

## 参考リンク

- [OpenAI Pricing](https://openai.com/pricing)
- [OpenAI Billing Settings](https://platform.openai.com/account/billing/overview)
- [OpenAI Usage Dashboard](https://platform.openai.com/usage)
- [OpenAI Error Codes](https://platform.openai.com/docs/guides/error-codes/api-errors)
- [OpenAI Rate Limits](https://platform.openai.com/docs/guides/rate-limits)

---

**最終更新**: 2025年11月5日  
**バージョン**: 1.0.0


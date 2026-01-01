# 音声文字起こし機能の実装

## 📋 概要

音声データのアップロードによる会話データ収集機能を実装しました。音声ファイルをアップロードすると、OpenAI Whisper APIを使用して自動的にテキストに変換されます。

## 🎯 実装内容

### 1. 音声文字起こしモック機能 (`lib/mock-ocr.ts`)

開発環境やAPIクォータ不足時に使用するモック機能を追加しました。

**追加された機能**:
- `mockTranscribeAudio()`: サンプルの会話テキストを返す
- 処理時間のシミュレート（2-4秒）
- 3種類のサンプル会話データ

### 2. 音声文字起こしAPIエンドポイント (`/api/conversation/transcribe`)

OpenAI Whisper APIを使用した音声文字起こしエンドポイントを作成しました。

**機能**:
- OpenAI Whisper API (`whisper-1`モデル) による音声→テキスト変換
- 日本語の明示的な指定
- モック実装へのフォールバック機能
- エラーハンドリング

**対応フォーマット**:
- MP3
- M4A
- WAV
- WebM
- FLAC

**ファイルサイズ制限**: 最大25MB（Whisper APIの制限）

### 3. フロントエンド更新 (`components/conversation/conversation-recorder.tsx`)

音声ファイルアップロード機能を実APIに接続しました。

**変更点**:
- 音声ファイルアップロード時に `/api/conversation/transcribe` APIを呼び出し
- エラーハンドリングの追加
- モック使用時の警告表示

## 🔧 環境変数設定

### OpenAI APIを使用する場合（推奨）

`.env.local`ファイルに以下を設定：

```bash
# OpenAI API Key（必須）
OPENAI_API_KEY=your_openai_api_key_here
```

### モックモードを使用する場合（開発環境・APIクォータ不足時）

`.env.local`ファイルに以下を設定：

```bash
# OpenAI API Key（任意 - モックモードでは不要）
OPENAI_API_KEY=your_openai_api_key_here

# モックモードを有効化
USE_MOCK_TRANSCRIBE=true
```

## 📝 使用方法

1. **当事者IDの入力**
   - 会話を記録する当事者のIDを入力（例: `25-001`）
   - または既存IDからクイック選択

2. **音声ファイルのアップロード**
   - 「音声データのアップロード」カードの「ファイルを選択」ボタンをクリック
   - 音声ファイル（MP3、M4A、WAV、WebM、FLAC）を選択
   - 自動的に文字起こしが開始されます

3. **テキストの確認・編集**
   - 文字起こし結果がテキストエリアに表示されます
   - 必要に応じて編集可能

4. **保存**
   - 「保存して分析」ボタンをクリック
   - 自動的に感情分析が実行され、データベースに保存されます

## 🧪 テスト方法

### 1. モックモードでのテスト

```bash
# .env.localに設定
USE_MOCK_TRANSCRIBE=true

# 開発サーバーを再起動
pnpm run dev
```

ブラウザで `http://localhost:3000/dashboard/conversation` にアクセスし、音声ファイルをアップロードしてください。モックデータが表示されます。

### 2. 実APIでのテスト

```bash
# .env.localに設定
OPENAI_API_KEY=sk-...

# USE_MOCK_TRANSCRIBEが設定されていないことを確認
# または以下をコメントアウト
# USE_MOCK_TRANSCRIBE=true

# 開発サーバーを再起動
pnpm run dev
```

ブラウザで `http://localhost:3000/dashboard/conversation` にアクセスし、実際の音声ファイルをアップロードしてください。Whisper APIで文字起こしされたテキストが表示されます。

## 📊 動作フロー

```
┌──────────────────────┐
│ 音声ファイル選択      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ FormData作成          │
│ /api/conversation/   │
│ transcribe へPOST    │
└──────┬───────────────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌────────────────┐  ┌─────────────────┐
│ OpenAI Whisper │  │ モック実装       │
│ API呼び出し     │  │ (フォールバック) │
└──────┬─────────┘  └────────┬────────┘
       │                     │
       └──────────┬──────────┘
                  │
                  ▼
┌──────────────────────┐
│ テキストエリアに表示  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 保存して分析          │
│ (既存フロー)          │
└──────────────────────┘
```

## 🔐 セキュリティ

- 認証チェック（`requireAuth()`）により、ログインユーザーのみアクセス可能
- ファイル形式とサイズのバリデーション
- OpenAI APIキーはサーバーサイドでのみ使用（クライアントに露出しない）

## 🚀 今後の拡張予定

1. **リアルタイム録音機能**
   - `MediaRecorder` APIを使用した音声録音
   - 録音データのBlob化とAPI送信

2. **音声ファイルの保存**
   - 音声ファイルをクラウドストレージに保存
   - データベースに`audioUrl`を記録

3. **話者識別**
   - 支援者と当事者の自動分離
   - 話者ごとの発言タイムスタンプ

## 📚 関連ファイル

- `lib/mock-ocr.ts`: モック実装
- `app/api/conversation/transcribe/route.ts`: 音声文字起こしAPI
- `components/conversation/conversation-recorder.tsx`: フロントエンドコンポーネント
- `lib/openai.ts`: OpenAIクライアント設定
- `app/api/conversation/save/route.ts`: データ保存API

## 🐛 トラブルシューティング

### エラー: "insufficient_quota"

OpenAI APIのクォータが不足しています。以下の対応を行ってください：

1. `.env.local` に `USE_MOCK_TRANSCRIBE=true` を設定してモックモードで動作
2. OpenAIのダッシュボードでクォータを確認
3. 課金情報の更新

### エラー: "対応していないファイル形式です"

以下の形式のみ対応しています：
- MP3 (`audio/mpeg`, `audio/mp3`)
- M4A (`audio/mp4`, `audio/x-m4a`)
- WAV (`audio/wav`)
- WebM (`audio/webm`)
- FLAC (`audio/flac`)

### エラー: "ファイルサイズが大きすぎます"

ファイルサイズは25MB以下に制限されています。音声ファイルを圧縮するか、短く分割してください。

---

**最終更新**: 2026年1月1日  
**実装者**: AI Assistant  
**関連機能**: F-001 会話データ収集機能



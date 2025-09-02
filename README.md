# arXiv Reader

最新の研究論文を日本語で読むためのウェブアプリケーション。arXiv APIから取得した論文を日本語に翻訳し、管理できます。

## 機能

- arXiv APIからの最新論文の自動取得
- 論文の日本語翻訳
- お気に入り機能
- メモ機能
- 既読管理
- Googleアカウントによるログイン認証

## 技術スタック

- **フロントエンド**: Next.js, React, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase, PostgreSQL, Prisma ORM
- **認証**: Next-Auth v5 (Auth.js)
- **デプロイ**: Vercel

## 開発環境のセットアップ

### 前提条件

- Node.js 18.x以上
- Docker Desktop
- npm または yarn

### インストール手順

1. リポジトリをクローン
   ```bash
   git clone https://github.com/yourusername/arxiv-reader.git
   cd arxiv-reader
   ```

2. 依存関係のインストール
   ```bash
   npm install
   # または
   yarn install
   ```

3. Supabaseローカル開発環境のセットアップ
   ```bash
   # Supabaseローカル開発環境を起動
   npx supabase start
   ```

4. 環境変数の設定
   `.env`ファイルを作成し、必要な環境変数を設定します：
   ```
   # データベース接続情報
   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres  # Prismaのメインデータベース接続URL
   DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres    # Prismaのダイレクト接続URL（マイグレーション用）
   
   # 認証情報
   CRON_SECRET="your-secret-key"              # Cronジョブの認証用秘密キー
   AUTH_SECRET="your-auth-secret"             # NextAuth.jsの暗号化キー（ランダム文字列）
   AUTH_GOOGLE_ID=your-google-client-id       # Google OAuth クライアントID
   AUTH_GOOGLE_SECRET=your-google-client-secret # Google OAuth クライアントシークレット
   MY_EMAIL=your-email@example.com            # 管理者のメールアドレス
   AUTH_URL=http://localhost:3000             # 認証のベースURL（本番環境では実際のドメイン）
   VERCEL_URL=http://localhost:3000           # Vercel デプロイ時のURL（ローカルでは localhost）
   
   # 翻訳API
   DEEPL_AUTH_KEY=your-deepl-auth-key # DeepL APIキー
   ```

5. データベースのセットアップ
   ```bash
   npx prisma migrate dev
   ```

6. 開発サーバーの起動
   ```bash
   npm run dev
   # または
   yarn dev
   ```

7. ブラウザで `http://localhost:3000` にアクセス

## データ取得と翻訳の設定

### 論文データの取得

論文データは定期的にCronジョブで取得されます。ローカル環境では以下のコマンドで手動実行できます：
```bash
curl -X GET http://localhost:3000/api/cron/papers -H "Authorization: Bearer your-cron-secret"
```

本番環境では、Vercel Cronを使用して自動実行しています。

### 翻訳システムの設定

翻訳はSupabaseのデータベースWebhookを活用して実装しています：

1. 新しい論文がデータベースに挿入される
2. SupabaseのWebhookが自動的に発火
3. Webhookが`/api/translate`エンドポイントを呼び出す
4. DeepL APIを使用してタイトルと要約を日本語に翻訳
5. 翻訳結果をデータベースに保存

本番環境のSupabase設定:

- Webhookトリガー: `INSERT ON papers`
- 対象URL: `https://your-app-url.com/api/translate`

## Supabaseローカル開発環境

このプロジェクトではSupabaseのローカル開発環境を使用しています。基本的な管理手順は以下の通りです：

### コンテナの起動
```bash
npx supabase start
```

### コンテナの停止
```bash
npx supabase stop
```

### データベース接続情報の確認
```bash
npx supabase status
```

### ダッシュボードへのアクセス
ローカルSupabaseダッシュボードは通常、以下のURLでアクセスできます：
```
http://localhost:54323
```
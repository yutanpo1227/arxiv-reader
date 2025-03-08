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
- **データベース**: PostgreSQL, Prisma ORM
- **認証**: Next-Auth v5 (Auth.js)
- **デプロイ**: Vercel

## 開発環境のセットアップ

### 前提条件

- Node.js 18.x以上
- PostgreSQL
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

3. 環境変数の設定
   `.env`ファイルを作成し、必要な環境変数を設定します：
   ```
   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
   DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
   CRON_SECRET="your-secret-key"
   AUTH_SECRET="your-auth-secret"
   AUTH_GOOGLE_ID=your-google-client-id
   AUTH_GOOGLE_SECRET=your-google-client-secret
   MY_EMAIL=your-email@example.com
   AUTH_URL=http://localhost:3000
   VERCEL_URL=http://localhost:3000
   TRANSLATE_API_URL=your-translation-api-url
   ```

4. データベースのセットアップ
   ```bash
   npx prisma migrate dev
   ```

5. 開発サーバーの起動
   ```bash
   npm run dev
   # または
   yarn dev
   ```

6. ブラウザで `http://localhost:3000` にアクセス

## データ取得の設定

論文データは定期的にCronジョブで取得されます。ローカル環境では以下のコマンドで手動実行できます：
```bash
curl -X GET http://localhost:3000/api/cron/papers -H "Authorization: Bearer your-cron-secret"
```


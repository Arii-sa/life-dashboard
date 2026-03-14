# 🏠 Life Dashboard

生活管理SPAポートフォリオ

## 技術スタック

| 項目 | 技術 |
|------|------|
| フロントエンド | Next.js 14 (App Router) + TypeScript |
| スタイリング | Tailwind CSS |
| バックエンド | Laravel 11 |
| 認証 | Laravel Sanctum |
| DB | MySQL 8.0 |
| インフラ | Docker |

## 機能

- 認証（新規登録・ログイン・ログアウト）
- カレンダー＋リマインダー
- タスクページ（フォルダ式Todoリスト）
- 学習タイマー＋バッジシステム
- マイページ（プロフィール・バッジ一覧）

---

## セットアップ手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/あなたのユーザー名/life-dashboard.git
cd life-dashboard
```

### 2. Next.js プロジェクト作成（初回のみ）

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd ..
```

### 3. Laravel プロジェクト作成（初回のみ）

```bash
cd backend
composer create-project laravel/laravel . "^11.0"
cd ..
```

### 4. Docker 起動

```bash
docker-compose up -d --build
```

### 5. Laravel 初期設定

```bash
# .env 設定
docker exec -it life-dashboard-backend cp .env.example .env
docker exec -it life-dashboard-backend php artisan key:generate

# マイグレーション
docker exec -it life-dashboard-backend php artisan migrate
```

### 6. アクセス確認

| サービス | URL |
|----------|-----|
| フロントエンド | http://localhost:3000 |
| バックエンドAPI | http://localhost:8000 |
| phpMyAdmin | http://localhost:8080 |

---

## ブランチ戦略

```
main        本番用（動くものだけ）
develop     開発用メインブランチ
feature/*   各機能開発（例: feature/auth, feature/calendar）
```

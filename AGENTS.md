# Repository Guidelines

## プロジェクト構成 & モジュール配置
- `app/`: Next.js App Router のエントリ。`layout.tsx` と `page.tsx` を基点に機能を分割。UI はサブディレクトリ（例: `app/(kanban)/components/`）へ。
- `public/`: 画像・アイコン等の静的アセット。
- `.next/`: ビルド成果物（コミットしない）。
- ルート: `package.json`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `next.config.ts`。

## ビルド・テスト・開発コマンド
- `npm run dev`: 開発サーバーを起動（ホットリロード）。
- `npm run build`: 本番ビルドを生成。
- `npm start`: 生成済みビルドを起動。
- `npm run lint`: ESLint による静的解析。
例: `npm ci && npm run build`

## コーディングスタイル & 命名規約
- 言語: TypeScript + React 19 / Next.js 16。
- インデントは 2 スペース。スタイルは ESLint（Next 設定）に準拠。
- コンポーネント: PascalCase（例: `TaskBoard.tsx`）。フック: `useXxx`。
- ルーティング: App Router に従いフォルダで定義（例: `app/board/page.tsx`）。
- Tailwind CSS 4 を使用。ユーティリティは論理順（レイアウト→サイズ→色）を心がける。

## テスト指針
- 現時点で公式テスト設定は未導入。追加時は `vitest` + `@testing-library/react` を推奨。
- 配置: `__tests__/` または対象ファイルと同階層。命名: `*.test.ts(x)`。
- 目標カバレッジ: statements 80% 以上。実行例（導入後）: `npm test`。

## コミット & プルリクエスト
- 履歴上の明確な規約は未定義。Conventional Commits を推奨：
  - 例: `feat: add column drag`, `fix: correct card reorder`。
- PR には目的、概要、主要変更点、関連 Issue、UI 変更時はスクリーンショットを添付。
- 変更は小さく、レビュー可能な単位で分割。

## セキュリティ & 設定
- 秘密情報は `.env.local` に保存し、`.env*` はコミットしない。
- Node.js 18+ を推奨。依存は `npm ci` で再現性を確保。
- 大きなアセットは `public/` 配下に配置。

## エージェント向け補足
- 本ファイルの規約はリポジトリ全体に適用。スコープ内の変更では命名・構成ルールを厳守してください。


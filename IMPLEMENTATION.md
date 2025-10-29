# 実装概要ドキュメント

## 1. 全体像と技術スタック

本リポジトリは Next.js 16 (App Router) と React 19 を基盤とした個人向けカンバンアプリケーションです。UI レイヤーは Tailwind CSS 4 を利用したユーティリティベースで構築し、ドラッグ＆ドロップは `@dnd-kit` エコシステムを採用しています。状態管理と永続化はローカルコンポーネントステートおよび `localStorage` によって完結し、バックエンドは存在しません。TypeScript による型定義を重視し、主要なロジックはユニットテストでカバーしています。

## 2. ディレクトリ構成と主要モジュール

- `app/board/[slug]/page.tsx` … ルーティングエントリ。slug ごとのボード画面をクライアントコンポーネントとして描画し、`BoardView` を動的インポート（SSR 無効化）しています。
- `app/board/[slug]/components/BoardView.tsx` … ボード全体のコンテナコンポーネント。UI 描画に専念し、フック `useBoardState` の返り値を用いて CRUD・DnD をハンドリングします。
- `app/board/[slug]/components/ColumnView.tsx`, `CardItem.tsx`, `AddCardForm.tsx` … 列・カード・追加フォームといった UI の分解コンポーネント。共通ボタンを `app/components/ui/Button.tsx` から利用します。
- `app/board/[slug]/hooks/useBoardState.ts` … ボード状態を扱うカスタムフック。`localStorage` からのロード、クラッド操作、永続化を担います。
- `app/board/[slug]/utils/dnd.ts` … `dnd-kit` 操作に付随する `cloneBoard` と `moveCard` を提供。列間移動や同一列内並び替えを純粋関数で実現しています。
- `lib/storage.ts` … `loadBoard` と `saveBoard` による永続化処理。未保存時の初期ボード生成、破損データ時の復旧を含みます。
- `lib/types.ts` … Board / Column / Card 型の定義。
- `lib/utils/cn.ts` … Tailwind クラス結合の軽量ユーティリティ。
- `lib/__tests__/`, `app/board/[slug]/utils/__tests__/`, `app/board/[slug]/hooks/__tests__/` … Vitest によるユニットテスト群。
- `app/globals.css` … ベーススタイルとカラーパレットの定義。明るいブルーグレー基調で UI を統一しています。

## 3. 状態管理と永続化戦略

`useBoardState` フックはアプリケーションの単一情報源です。初期化時に `loadBoard(slug)` を呼び出し、`localStorage` に保存された JSON を復元します。データが存在しない、または JSON パースに失敗した場合は `createInitialBoard` により Todo / In Progress / Done の 3 列を生成し直します。列およびカードの CRUD 操作はすべてこのフック経由で実行され、`updateBoard` に渡されたアップデータ関数が最新状態を反映します。`useEffect` による依存監視で `board` が更新されるたびに `saveBoard` が呼び出されるため、ユーザー操作は即座にブラウザストレージへ永続化されます。

## 4. ドラッグ＆ドロップ処理の設計

DnD は `@dnd-kit/core` の `DndContext` と `@dnd-kit/sortable` の `SortableContext` を利用しています。`BoardView` では `onDragStart`, `onDragOver`, `onDragEnd`, `onDragCancel` を実装し、各イベントで `moveCard` ヘルパーに処理を委譲します。`moveCard` は列 ID やカード ID を判別し、同一列内であれば `arrayMove` による並べ替え、列間移動の場合は挿入位置を算出して新しいカード配列を生成します。ドラッグ中の視覚的な追従には `DragOverlay` を使用し、現在掴んでいるカード内容をスクエアなスタイルで表示しています。また、`cloneBoard` によってディープコピーを取得することで、DnD 操作中に元のステートを破壊しないように配慮しています。

## 5. UIとスタイリングの方針

スタイルは Tailwind CSS ユーティリティを中心に構成しつつ、再利用できる部品を `Button` コンポーネントとして抽出しています。角の丸みを排除したスクエアなビジュアルを採用し、背景色や枠線・影を統一することで情報のヒエラルキーを明瞭化しました。入力フォームは `flex-wrap` を用いて狭い列幅でも破綻しないよう調整し、フォーカスリングやホバー時の色変化でアクセシビリティを確保しています。`app/globals.css` ではベースとなるカラーパレットを CSS 変数で定義し、淡いブルー系の背景と濃いグレーのテキストカラーによる高い視認性を提供しています。

## 6. テスト戦略

Vitest と Testing Library を導入し、重要なロジック層をユニットテストでカバーしています。

- `lib/__tests__/storage.test.ts` では初期ボード生成、保存処理、破損データ復旧を検証。`nanoid` をモック化して再現性を持たせています。
- `app/board/[slug]/utils/__tests__/dnd.test.ts` は `moveCard` の振る舞いに焦点を当て、同一列並べ替え・空列への移動・他列の中間挿入・異常系 (カード未存在) を網羅します。
- `app/board/[slug]/hooks/__tests__/useBoardState.test.tsx` は `renderHook` を用いて列／カードの CRUD と `localStorage` への同期を確認しています。

現状はロジック層のテストが中心のため、将来的には UI コンポーネントのスナップショットテストやブラウザ操作を伴う E2E テスト（Playwright / Cypress）を追加する余地があります。

## 7. ビルド・開発・テストコマンド

- 開発サーバー: `npm run dev`
- 本番ビルド: `npm run build`
- 本番起動: `npm start`
- Lint: `npm run lint`
- 単体テスト: `npm run test`
- ウォッチテスト: `npm run test:watch`

これらのコマンドは `package.json` の `scripts` に登録済みであり、Vite ベースの Vitest がテスト実行を担います。

## 8. レイアウトとアクセシビリティへの配慮

各列は横スクロール可能なフレックスボックスで並び、狭い画面でも最低限の操作ができるよう配慮しています（スマホ最適化は必須要件ではないため、完全なレスポンシブ設計には至っていません）。ドラッグ対象の `CardItem` コンテナはキーボードフォーカスが可能で、編集完了時にはフォーカスを元のカードへ戻すなど操作感にも配慮しています。また、Enter／Escape キーによるショートカット（追加／キャンセル）を実装し、キーボード操作主体でもカード編集が完結できるようになっています。

## 9. 今後の拡張可能性

- **データ永続化の抽象化**: 現状 `localStorage` 固定の実装を `BoardRepository` インターフェース化することで、将来的に外部 API や同期ストレージへ移行しやすい構造を目指せます。
- **DnD の視覚的フィードバック強化**: ドロップ先ハイライトやプレビュー用プレースホルダを追加すると直感性が向上します。
- **UI コンポーネントの細分化**: `ColumnView` や `CardItem` をさらに分割（ヘッダー・ボディ・アクションなど）すると、テーマ差し替えやアクセシビリティ改善を行いやすくなります。
- **テスト範囲の拡張**: UI レイヤーのテスト、E2E テスト、ドラッグ操作のモック化などにより信頼性を高める余地があります。

## 10. まとめ

本実装は Next.js App Router の構造を活かしつつ、フロントエンドのみで完結する個人用カンバンアプリケーションを実現しています。状態管理は `useBoardState` に集約され、DnD や CRUD といったビジネスロジックは純粋関数やテスト可能な関数へ切り出されています。UI は角張ったミニマルなデザインで統一し、キーボード操作やフォーカス制御にも配慮しました。Vitest ベースのテストスイートを整えたことで、今後のリファクタリングや新機能追加時にも安心して変更を進められる構成になっています。


# Obsidian Interactive Codeblock

Obsidianのマークダウンノート内で、`interactive` コードブロックにHTML/CSS/JSを書くと、その場でインラインにレンダリングされてインタラクティブに操作できるプラグインです。

## 使い方

````markdown
```interactive
<div id="app">
  <button id="btn">クリック</button>
  <p id="count">0</p>
</div>
<style>
  #app { text-align: center; padding: 20px; }
  button { padding: 8px 16px; border-radius: 8px; cursor: pointer; }
</style>
<script>
  let count = 0;
  document.getElementById("btn").onclick = () => {
    count++;
    document.getElementById("count").textContent = count;
  };
</script>
```
````

## 特徴

- **インラインレンダリング**: コードブロックの内容がiframeとしてその場に表示されます
- **インタラクティブ操作**: JavaScript を含むコンテンツが動作し、ボタンクリックなどの操作が可能です
- **高さ自動調整**: iframeの高さがコンテンツに合わせて自動的に調整されます
- **ダークモード対応**: Obsidianのテーマ（ライト/ダーク）を検知してiframe内に反映します
- **セキュリティ**: iframeの`sandbox`属性で`allow-scripts`のみ許可し、安全に実行します

## インストール

1. このリポジトリをクローンまたはダウンロードします
2. `npm install && npm run build` を実行します
3. `main.js`、`manifest.json`、`styles.css` を Obsidian の Vault の `.obsidian/plugins/obsidian-interactive-codeblock/` にコピーします
4. Obsidian の設定 → コミュニティプラグイン → Interactive Codeblock を有効にします

## 開発

```bash
npm install
npm run dev   # 開発モード（ファイル監視）
npm run build # プロダクションビルド
```

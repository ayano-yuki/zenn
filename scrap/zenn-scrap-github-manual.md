# ZennのスクラップをGithubで管理したい（手動）

- Created at: 2025-08-31
- Closed: false
- Archived: false

---

# やり方
1. 画面右上にある自身のアイコンをクリックし、「スクラップの管理」を選択する
2. 管理したい任意のスクラップの右にある「∨」をクリックし、「JSONで内容を出力」を選択する
3. 出力されたJSONを管理先のフォルダにコピペする
4. 以下のjson2mdを使って変換する
5. Githubにプッシュする

---

# プログラム
- プログラムの実行に必要なモジュールが必要になるので、`npm install --save-dev @types/node`を必要に応じて叩く

```typescript
// ---------------------------------------------------------
// 
// generate-md.ts
// 実行コマンド: tsx generate-md.ts <input.json>
// 
// ---------------------------------------------------------

import * as fs from "fs";
import * as path from "path";

// コマンドライン引数の取得
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error("Usage: tsx generate-md.ts <input.json>");
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), args[0]);
if (!fs.existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

// JSONの読み込み
const raw = fs.readFileSync(inputPath, "utf-8");
const json = JSON.parse(raw);

// Markdownを構築
let markdown = `# ${json.title}\n\n`;
markdown += `- Created at: ${json.created_at}\n`;
markdown += `- Closed: ${json.closed}\n`;
markdown += `- Archived: ${json.archived}\n\n`;

json.comments.forEach((comment: any, idx: number) => {
  markdown += `---\n\n`;
  // markdown += `### Comment ${idx + 1}\n`;
  // markdown += `- Author: ${comment.author}\n`;
  // markdown += `- Created at: ${comment.created_at}\n`;
  // markdown += `- Updated at: ${comment.body_updated_at}\n\n`;
  markdown += `${comment.body_markdown}\n\n`;
});

// 出力ディレクトリを決定（一つ下の階層にmarkdownを生成）
const outputDir = path.join(path.dirname(inputPath), "../");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 出力ファイルパス
const outputPath = path.join(
  outputDir,
  path.basename(inputPath, ".json") + ".md"
);

fs.writeFileSync(outputPath, markdown, "utf-8");
console.log(`Markdown file generated: ${outputPath}`);
```


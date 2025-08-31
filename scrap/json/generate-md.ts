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

// 出力ディレクトリを決定
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

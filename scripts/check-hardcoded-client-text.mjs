import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = ["app", "components"];
const FILE_EXTENSIONS = new Set([".tsx"]);

const hasUseClient = (content) => /(^|\n)\s*['"]use client['"]\s*;?/.test(content);

const walk = (dir, files = []) => {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (FILE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
};

const findHardcodedText = (content) => {
  const results = [];
  // Only flag inline text nodes between tags on the same line.
  const regex = />([^<\n]*[A-Za-z][^<\n]*)</g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const raw = match[1];
    const text = raw.trim();
    if (!text) continue;
    // Skip JSX expressions or non-text artifacts.
    if (/[{}=()]/.test(text)) continue;
    results.push({ index: match.index, text });
  }
  return results;
};

const formatLineNumber = (content, index) => {
  return content.slice(0, index).split("\n").length;
};

const problems = [];

for (const dir of TARGET_DIRS) {
  const absDir = path.join(ROOT, dir);
  const files = walk(absDir);
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    if (!hasUseClient(content)) continue;
    const matches = findHardcodedText(content);
    for (const match of matches) {
      problems.push({
        file: path.relative(ROOT, file),
        line: formatLineNumber(content, match.index),
        text: match.text,
      });
    }
  }
}

if (problems.length > 0) {
  console.error("Hardcoded text found in 'use client' components:");
  for (const problem of problems) {
    console.error(`- ${problem.file}:${problem.line} -> "${problem.text}"`);
  }
  process.exit(1);
}

console.log("No hardcoded text found in 'use client' components.");

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const extensions = ['.jsx', '.js', '.css'];
const srcDir = path.join(__dirname, 'src');
const serverDir = path.join(__dirname, 'server');
const outputFile = path.join(__dirname, 'memo_vault_source.md');

let markdown = '# MemoVault Project Source Code\n\n';
markdown += 'This document contains all the frontend and backend source code for the MemoVault application.\n\n';

function crawl(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      crawl(fullPath);
    } else if (extensions.includes(path.extname(file))) {
      // Skip potentially huge generated files or assets just in case, but target our source code
      const content = fs.readFileSync(fullPath, 'utf8');
      const relativePath = path.relative(__dirname, fullPath).replace(/\\/g, '/');
      
      markdown += `## \`${relativePath}\`\n\n`;
      markdown += '```' + (relativePath.endsWith('.css') ? 'css' : 'javascript') + '\n';
      markdown += content + '\n';
      markdown += '```\n\n';
    }
  }
}

try {
  console.log('Extracting source code...');
  crawl(srcDir);
  
  if (fs.existsSync(serverDir)) {
      crawl(serverDir);
  }
  
  // also grab index.html
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
      markdown += `## \`index.html\`\n\n\`\`\`html\n${fs.readFileSync(indexPath, 'utf8')}\n\`\`\`\n\n`;
  }

  fs.writeFileSync(outputFile, markdown);
  console.log('✅ Success! All your source code has been bundled into: ' + outputFile);
  console.log('You can now open this file, copy its contents, and paste it into Gemini or any other platform!');
} catch (error) {
  console.error('Failed to extract source code:', error);
}

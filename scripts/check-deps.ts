import * as fs from 'fs';
import * as path from 'path';

function findPuppeteerReferences(dir: string) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules') {
        findPuppeteerReferences(fullPath);
      }
    } else if (file === 'package.json') {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('puppeteer')) {
        console.log('Found Puppeteer reference in:', fullPath);
      }
    }
  });
}

findPuppeteerReferences('.');

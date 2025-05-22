import { bundleMDX } from 'mdx-bundler';
import fs from 'node:fs/promises';

export async function readMdxContent() {
  const fileContent = await fs.readFile(
    (process.cwd(), 'app/content.mdx'),
    'utf-8',
  );
  if (!fileContent) {
    return null;
  }
  return (await bundleMDX({ source: fileContent })).code;
}

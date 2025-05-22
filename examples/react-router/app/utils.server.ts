import { bundleMDX } from 'mdx-bundler';
import fs from 'node:fs/promises';
import rehypeSlug from 'rehype-slug';

export async function readMdxContent() {
  const fileContent = await fs.readFile(
    (process.cwd(), 'app/content.mdx'),
    'utf-8',
  );
  if (!fileContent) {
    return null;
  }
  return (
    await bundleMDX({
      source: fileContent,
      mdxOptions(options) {
        options.remarkPlugins = [...(options.remarkPlugins ?? [])];
        options.rehypePlugins = [...(options.rehypePlugins ?? []), rehypeSlug];
        return options;
      },
    })
  ).code;
}

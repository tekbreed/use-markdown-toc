import type { Route } from './+types/home';
import React from 'react';
import { getMDXComponent } from 'mdx-bundler/client';
import { useMarkdownToc } from 'use-markdown-toc';
import { Link } from 'react-router';
import { readMdxContent } from '~/utils.server';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export async function loader() {
  const code = (await readMdxContent()) as string;
  return { code };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const Component = React.useMemo(
    () => getMDXComponent(loaderData.code),
    [loaderData.code],
  );
  const [headings, activeId] = useMarkdownToc({
    containerId: 'content',
  });
  console.log(headings, activeId);

  return (
    <main className="pt-8 p-4 container mx-auto">
      <nav className="border-b">
        <h1 className="text-2xl">Markdown Toc</h1>
      </nav>
      <div className="flex">
        <main id="content">
          <Component />
        </main>
        <aside>
          <h3 className="mb-4 text-lg font-bold">Table of Contents</h3>
          <nav className="space-y-3">
            <ul>
              {headings?.length ? (
                headings.map((heading, i) => {
                  const { id, text } = heading;
                  const activeItem = activeId === id;
                  return (
                    <li key={id}>
                      <Link
                        to={`#${id}`}
                        className={`${activeItem ? 'text-blue-700 dark:text-blue-600' : ''} block text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400`}
                      >
                        <span className="mr-2 font-bold">{`${i + 1}`}.</span>
                        {text}
                      </Link>
                    </li>
                  );
                })
              ) : (
                <>
                  <div className="h-2 w-full" />
                  <div className="mt-2 h-2 w-full" />
                </>
              )}
            </ul>
          </nav>
        </aside>
      </div>
    </main>
  );
}

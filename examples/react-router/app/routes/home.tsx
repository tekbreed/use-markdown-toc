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

  return (
    <main className="pt-8 p-4 container mx-auto">
      <nav className="border-b">
        <h1 className="text-2xl">Markdown Toc</h1>
      </nav>
      <div className="flex">
        <main id="content">
          <Component
            components={{
              h1: (props) => <h1 {...props} className="my-12 text-3xl" />,
              h2: (props) => <h2 {...props} className="my-12 text-2xl" />,
              h3: (props) => <h3 {...props} className="my-12" />,
            }}
          />
        </main>
        <aside>
          <h3 className="mb-4 text-lg font-bold">Table of Contents</h3>
          <nav className="space-y-3 sticky top-20">
            <ul>
              {headings?.length ? (
                headings.map((heading, i) => {
                  const { id, text, level } = heading;
                  const activeItem = activeId === id;

                  console.log(activeId, id);

                  let levelClassName = '';
                  if (level === 2) {
                    levelClassName = 'ml-2';
                  } else if (level === 3) {
                    levelClassName = 'ml-3';
                  } else if (level === 4) {
                    levelClassName = 'ml-4';
                  }

                  return (
                    <li key={id} className={levelClassName}>
                      <Link
                        to={`#${id}`}
                        className={`block text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 ${activeItem ? 'text-blue-500' : ''} `}
                      >
                        <span className="mr-2 font-bold">
                          {`${i + 1}.${level}`}.
                        </span>
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

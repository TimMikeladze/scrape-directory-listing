import { it, expect } from 'vitest';
import { mkdirSync, rmdirSync } from 'fs';
import { resolve } from 'path';
import { writeFile } from 'fs/promises';
import { scrapeDirectoryListing } from '../src';

it('works', async () => {
  const res = await scrapeDirectoryListing({
    url: 'https://www.ndbc.noaa.gov/data/ocean',
  });
  expect(res.length).toBeGreaterThan(0);

  try {
    rmdirSync(resolve(process.cwd(), 'tests', 'output'), { recursive: true });
  } catch (e) {
    //
  }
  try {
    mkdirSync(resolve(process.cwd(), 'tests', 'output'), { recursive: true });
  } catch (e) {
    //
  }

  // create folder if it doesn't exist given the path
  const createFolder = (path: string) => {
    const lastSlash = path.lastIndexOf('/');
    const modifiedPath = path.slice(0, lastSlash);
    const parts = modifiedPath.split('/');
    let current = '';
    // eslint-disable-next-line no-restricted-syntax
    for (const part of parts) {
      current += `${part}/`;
      try {
        mkdirSync(resolve(process.cwd(), 'tests', 'output', current));
      } catch (e) {
        //
      }
    }
  };

  await Promise.all(
    res.map((x) => {
      let { pathname } = new URL(x.item.url);
      // remove the leading slash
      if (pathname.startsWith('/')) {
        pathname = pathname.slice(1);
      }
      createFolder(pathname);
      return writeFile(
        resolve(process.cwd(), 'tests', 'output', pathname),
        Buffer.from(x.data)
      );
    })
  );
});

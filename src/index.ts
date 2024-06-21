import { JSDOM } from 'jsdom';

interface DirectoryListingItem {
  description: string;
  modifiedAt: number;
  name: string;
  path: string;
  size: number | null;
  type: 'file' | 'directory';
}

export interface ParseDirectoryListingHtmlArgs {
  html: string;
}

export const parseDirectoryListingHtml = (
  args: ParseDirectoryListingHtmlArgs
): DirectoryListingItem[] => {
  const { html } = args;
  const { document } = new JSDOM(html).window;
  const rows = document.querySelectorAll('table tr');
  const files: DirectoryListingItem[] = [];

  rows.forEach((row, index) => {
    // Skip the header row
    if (index === 0) return;

    const cells = row.querySelectorAll('td');
    if (cells.length < 5) return;

    const nameElement = cells[1].querySelector('a');
    const name = nameElement ? nameElement.textContent || '' : '';

    if (name.toLowerCase() === 'parent directory') {
      return;
    }

    const path = nameElement ? nameElement.getAttribute('href') || '' : '';

    const type = path.endsWith('/') ? 'directory' : 'file';

    const modifiedAtText = cells[2].textContent?.trim() || '';
    const modifiedAt = new Date(modifiedAtText).getTime();
    const sizeText = cells[3].textContent?.trim() || '';
    const size = sizeText === '-' ? null : sizeText;
    const parsedSize = size ? parseFileSize(size) : null;
    const description = cells[4].textContent?.trim() || '';

    files.push({
      type,
      name,
      path,
      modifiedAt,
      size: parsedSize,
      description,
    });
  });

  return files;
};

export interface FetchDirectoryListingArgs {
  concurrency?: number;
  fetchListingFn?: (url: string) => Promise<Response>;

  url: string;
}

export const fetchDirectoryListing = async (
  args: FetchDirectoryListingArgs,
  path: string = ''
): Promise<DirectoryListingItem[]> => {
  const { fetchListingFn, url } = args;
  const baseUrl = new URL(url).origin;
  const currentPath = path || new URL(url).pathname;
  const response = fetchListingFn
    ? await fetchListingFn([baseUrl, currentPath].join('/'))
    : await fetch([baseUrl, currentPath].join('/'));
  const html = await response.text();
  let items = parseDirectoryListingHtml({ html });

  items = items.map((item) => {
    if (item.type === 'file') {
      return {
        ...item,
        path: [item.path].join('/').replace(/([^:]\/)\/+/g, '$1'),
      };
    }
    return item;
  });

  await Promise.all(
    items
      .filter((item) => item.type === 'directory')
      .map(async (item) => {
        const newPath = [currentPath, item.path].join('/');
        const subDirectoryItems = await fetchDirectoryListing(
          {
            fetchListingFn,
            url: [baseUrl, newPath].join('/'),
          },
          newPath
        );
        items.push(
          ...subDirectoryItems.map((x) => ({
            ...x,
            path: [baseUrl, newPath, x.path]
              .join('/')
              .replace(/([^:]\/)\/+/g, '$1'),
          }))
        );
      })
  );

  return items;
};

export const parseFileSize = (size: string): number => {
  // Regular expression to match the size with optional units
  const regex = /^(\d+(\.\d+)?)\s*(B|K|KB|M|MB|G|GB|T|TB|P|PB)?$/i;
  const match = size.match(regex);

  if (!match) {
    throw new Error(`Invalid file size format: ${size}`);
  }

  const value = parseFloat(match[1]);
  const unit = match[3] ? match[3].toUpperCase() : 'B'; // Default to 'B' if no unit is specified

  // Define unit multipliers
  const units: { [key: string]: number } = {
    B: 1,
    K: 1024,
    KB: 1024,
    M: 1024 * 1024,
    MB: 1024 * 1024,
    G: 1024 * 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    T: 1024 * 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
    P: 1024 * 1024 * 1024 * 1024 * 1024,
    PB: 1024 * 1024 * 1024 * 1024 * 1024,
  };

  if (!units[unit]) {
    throw new Error(`Unknown unit: ${unit}`);
  }

  // Convert to bytes and round to the nearest integer
  const bytes = value * units[unit];
  return Math.round(bytes);
};

export interface ScrapeDirectoryListingArgs {
  fetchFileFn?: (item: DirectoryListingItem) => Promise<Response>;
  fetchListingFn?: (url: string) => Promise<Response>;

  url: string;
}

export const scrapeDirectoryListing = async (
  args: ScrapeDirectoryListingArgs
): Promise<
  {
    data: string;
    item: DirectoryListingItem;
  }[]
> => {
  const items = (await fetchDirectoryListing(args)).filter(
    (x) => x.type === 'file'
  );

  return Promise.all(
    items.map(async (item) => {
      const response = args.fetchFileFn
        ? await args.fetchFileFn(item)
        : await fetch(item.path);

      return {
        item,
        data: await response.text(),
      };
    })
  );
};

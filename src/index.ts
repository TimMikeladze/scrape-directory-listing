import { JSDOM } from 'jsdom';

interface DirectoryListingItem {
  description: string;
  modifiedAt: number;
  name: string;
  path: string;
  size: string | null;
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
    const description = cells[4].textContent?.trim() || '';

    files.push({
      type,
      name,
      path,
      modifiedAt,
      size,
      description,
    });
  });

  return files;
};

export interface FetchDirectoryListingArgs {
  fetchFn?: () => Promise<Response>;
  url: string;
}

export const fetchDirectoryListing = async (
  args: FetchDirectoryListingArgs
): Promise<DirectoryListingItem[]> => {
  const response = args.fetchFn ? await args.fetchFn() : await fetch(args.url);
  const html = await response.text();
  return parseDirectoryListingHtml({ html });
};

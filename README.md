# 📂 scrape-directory-listing

Download all the files from a directory listing such as https://www.ndbc.noaa.gov/data/ocean/.

## 📡 Install

```console
npm install scrape-directory-listing

yarn add scrape-directory-listing

pnpm add scrape-directory-listing
```

> 👋 Hello there! Follow me [@linesofcode](https://twitter.com/linesofcode) or visit [linesofcode.dev](https://linesofcode.dev) for more cool projects like this one.

## 🚀 Getting started

This example will recursively download all the files from https://www.ndbc.noaa.gov/data/ocean/.

```ts
import { scrapeDirectoryListing } from 'scrape-directory-listing';

const res = await scrapeDirectoryListing({
  url: 'https://www.ndbc.noaa.gov/data/ocean',
});
```

The response will contain an array of objects with the following properties:

```ts
{
    item: {
        description: string;
        modifiedAt: number;
        name: string;
        path: string;
        size: number | null;
        type: 'file' | 'directory';
    },
    data: ArrayBuffer;
    headers: Headers;
}
```

## 📝 Writing to the file system

```ts
import { scrapeDirectoryListing } from 'scrape-directory-listing';
import { writeFile } from 'fs/promises';

const res = await scrapeDirectoryListing({
  url: 'https://www.ndbc.noaa.gov/data/ocean',
});

const first = res[0];

await writeFile('output/' + first.item.name, Buffer.from(first.data));
```

## ⌛ Custom fetch and concurrency

You can pass fetch function and combine with custom logic, for example to control current number of concurrent requests.

```ts
import { scrapeDirectoryListing } from 'scrape-directory-listing';
import pLimit from 'p-limit';

// Limit to 1 request at a time
const limit = pLimit(1);

const res = await scrapeDirectoryListing({
  url: 'https://www.ndbc.noaa.gov/data/ocean',
  fetchFileFn: async (item) => {
    return limit(() => fetch(item.url));
  },
});
```

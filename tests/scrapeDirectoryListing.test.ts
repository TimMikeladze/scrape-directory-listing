import { it, expect } from 'vitest';
import { scrapeDirectoryListing } from '../src';

it('works', async () => {
  const res = await scrapeDirectoryListing({
    url: 'https://www.ndbc.noaa.gov/data/drift/',
  });
  expect(res.length).toBeGreaterThan(0);
});

import { it, expect } from 'vitest';
import { fetchDirectoryListing } from '../src';

it('works', async () => {
  const res = await fetchDirectoryListing({
    url: 'https://www.ndbc.noaa.gov/data/realtime2',
  });

  // expect res to match array of objects of a certain shape
  expect(res).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        description: expect.any(String),
        modifiedAt: expect.any(Number),
        name: expect.any(String),
        path: expect.any(String),
        size: expect.any(String),
        type: expect.any(String),
      }),
    ])
  );
});

import { it, expect } from 'vitest';
import { fetchDirectoryListing } from '../src';

it(
  'works',
  async () => {
    const one = await fetchDirectoryListing({
      url: 'https://www.ndbc.noaa.gov/data/realtime2',
    });

    expect(one).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: expect.any(String),
          modifiedAt: expect.any(Number),
          name: expect.any(String),
          path: expect.any(String),
          size: expect.any(Number),
          type: expect.any(String),
        }),
      ])
    );

    const two = await fetchDirectoryListing({
      url: 'https://www.ndbc.noaa.gov/data/ocean',
    });

    expect(two).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: expect.any(String),
          modifiedAt: expect.any(Number),
          name: expect.any(String),
          path: expect.any(String),
          type: expect.any(String),
        }),
      ])
    );

    expect(two.find((item) => item.type === 'file')).toBeDefined();
  },
  {
    timeout: 30000,
  }
);

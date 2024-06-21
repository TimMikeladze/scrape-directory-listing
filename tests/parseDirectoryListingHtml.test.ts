import { it, expect } from 'vitest';
import { parseDirectoryListingHtml } from '../src';
import example from './data/example';

it('works', () => {
  expect(
    parseDirectoryListingHtml({
      html: example,
    })
  ).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        description: expect.any(String),
        modifiedAt: expect.any(Number),
        name: expect.any(String),
        url: expect.any(String),
        size: expect.any(Number),
        type: expect.any(String),
      }),
    ])
  );
});

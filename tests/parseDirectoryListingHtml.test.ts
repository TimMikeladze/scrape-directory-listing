import { it, expect } from 'vitest';
import { parseDirectoryListingHtml } from '../src';
import example from './data/example';

it('works', () => {
  expect(
    parseDirectoryListingHtml({
      html: example,
    }).sort((a, b) => b.modifiedAt - a.modifiedAt)
  ).toMatchSnapshot();
});

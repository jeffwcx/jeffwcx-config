import { describe, expect, it } from 'vitest';
import { LicenseProcessor, type RequiredArgs } from '../processor';
import data from './data';

const renderArgs: RequiredArgs = {
  fromYear: '2024',
  author: 'jeff',
  email: 'xxxx@xxx.com',
  project: 'xxxxx',
};

describe('license processor', () => {
  for (const [title, lic] of data) {
    it(title, () => {
      const processor = new LicenseProcessor(lic);
      const args = processor.getUnknownArgs();
      if (!args) {
        expect(processor.render(renderArgs)).toMatchSnapshot();
      } else if (!args.replaceAll) {
        Object.values(args.placeholders).forEach((infos) => {
          infos.forEach((info) => {
            expect(lic.slice(info.start + 1, info.end)).toBe(info.placeholder);
          });
        });
        expect(processor.render(renderArgs)).toMatchSnapshot();
      } else {
        expect(
          lic.slice(args.replaceAll.start, args.replaceAll.end + 1),
        ).toMatchSnapshot();
      }
    });
  }

  it('should be able to customize KnownArgs', () => {
    const processor = new LicenseProcessor(
      `Copyright <YEAR> <HOLDERS> <PRODUCT>`,
      ['product'],
    );
    expect(processor.getUnknownArgs()).toBeNull();
    expect(
      processor.render({
        fromYear: '2024',
        author: 'xxxx',
        product: 'xxxxx',
        email: 'xxx@xxx.com',
      }),
    ).toMatchInlineSnapshot(`"Copyright 2024 xxxx xxxxx"`);
  });
});

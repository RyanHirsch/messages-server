import genericSerializer from '../generic-serializer';

describe('genericSerializer', () => {
  const first = { a: 1 };
  const otherFirst = { toJSON: () => first };
  const second = { b: 2 };
  const otherSecond = { toJSON: () => second };
  const items = [first, second];

  it('handles a plain object', () => {
    const item = first;
    const result = genericSerializer(item);
    expect(result).toEqual({ data: item });
  });

  it('handles an array of plain objects', () => {
    const result = genericSerializer(items);
    expect(result).toEqual({ data: items });
  });

  it('calls the toJSON method on the object when it exists', () => {
    const foo = {
      toJSON: () => first,
    };
    const result = genericSerializer(foo);
    expect(result).toEqual({ data: first });
  });
  it('calls the toJSON method on the object when it exists', () => {
    const result = genericSerializer(otherFirst);
    expect(result).toEqual({ data: first });
  });
  it('calls the toJSON method on multiple objects when it exists', () => {
    const result = genericSerializer([otherFirst, otherSecond]);
    expect(result).toEqual({ data: [first, second] });
  });
});

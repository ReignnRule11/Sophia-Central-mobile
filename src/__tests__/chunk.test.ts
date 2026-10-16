import { splitArrayBufferIntoChunks } from '../utils/chunk';

test('splitArrayBufferIntoChunks splits buffer correctly', () => {
  const size = 1024 * 1024;
  const total = 5 * size + 123;
  const buffer = new ArrayBuffer(total);
  const chunks = splitArrayBufferIntoChunks(buffer, size);
  expect(chunks.length).toBe(6);
  let sum = 0;
  for (const c of chunks) sum += c.byteLength;
  expect(sum).toBe(total);
});

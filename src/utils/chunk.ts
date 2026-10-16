export function splitArrayBufferIntoChunks(buffer: ArrayBuffer, chunkSize: number): ArrayBuffer[] {
  const result: ArrayBuffer[] = [];
  let offset = 0;
  while (offset < buffer.byteLength) {
    const size = Math.min(chunkSize, buffer.byteLength - offset);
    result.push(buffer.slice(offset, offset + size));
    offset += size;
  }
  return result;
}

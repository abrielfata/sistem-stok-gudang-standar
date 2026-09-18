import { describe, it, expect } from 'vitest';
import { allocateFifo, FifoItem } from '../src/helpers/fifo.helper.js';
import { BadRequestError } from '../src/errors/AppError.js';

describe('FIFO Allocator Helper', () => {
  it('should correctly allocate from multiple batches using FIFO', () => {
    const batches: FifoItem[] = [
      { id: 'batch-1', availableQty: 10 },
      { id: 'batch-2', availableQty: 15 },
      { id: 'batch-3', availableQty: 20 },
    ];

    const allocations = allocateFifo(batches, 18);

    expect(allocations).toEqual([
      { id: 'batch-1', qty: 10 },
      { id: 'batch-2', qty: 8 },
    ]);
  });

  it('should allocate exact amount from first batch if enough', () => {
    const batches: FifoItem[] = [
      { id: 'batch-1', availableQty: 10 },
      { id: 'batch-2', availableQty: 15 },
    ];

    const allocations = allocateFifo(batches, 5);

    expect(allocations).toEqual([
      { id: 'batch-1', qty: 5 },
    ]);
  });

  it('should throw BadRequestError if requested quantity exceeds total available', () => {
    const batches: FifoItem[] = [
      { id: 'batch-1', availableQty: 5 },
      { id: 'batch-2', availableQty: 10 },
    ];

    expect(() => allocateFifo(batches, 20)).toThrow(BadRequestError);
  });

  it('should throw BadRequestError if requested quantity is zero or negative', () => {
    const batches: FifoItem[] = [
      { id: 'batch-1', availableQty: 5 },
    ];

    expect(() => allocateFifo(batches, 0)).toThrow(BadRequestError);
    expect(() => allocateFifo(batches, -5)).toThrow(BadRequestError);
  });
});

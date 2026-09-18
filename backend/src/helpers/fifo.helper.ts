import { BadRequestError } from '../errors/AppError.js';

export interface FifoItem {
  id: string; // Movement ID or Batch ID
  availableQty: number; // Qty remaining in this batch
}

export interface FifoAllocation {
  id: string;
  qty: number;
}

/**
 * Murni fungsi logika alokasi FIFO (pure function)
 * Asumsi `items` sudah diurutkan dari yang paling lama ke terbaru (ASC).
 */
export function allocateFifo(items: FifoItem[], requestedQty: number): FifoAllocation[] {
  if (requestedQty <= 0) {
    throw new BadRequestError('Requested qty must be greater than 0');
  }

  const totalAvailable = items.reduce((sum, item) => sum + item.availableQty, 0);
  if (totalAvailable < requestedQty) {
    throw new BadRequestError(`Insufficient stock. Requested: ${requestedQty}, Available: ${totalAvailable}`);
  }

  const allocations: FifoAllocation[] = [];
  let remainingToAllocate = requestedQty;

  for (const item of items) {
    if (remainingToAllocate <= 0) break;
    if (item.availableQty <= 0) continue;

    const allocated = Math.min(item.availableQty, remainingToAllocate);
    allocations.push({
      id: item.id,
      qty: allocated,
    });

    remainingToAllocate -= allocated;
  }

  return allocations;
}

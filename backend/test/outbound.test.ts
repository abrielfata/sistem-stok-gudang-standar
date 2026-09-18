import { describe, it, expect, vi } from 'vitest';
import { OutboundService } from '../src/services/outbound.service.js';
import { InventoryService } from '../src/services/inventory.service.js';
import { BadRequestError } from '../src/errors/AppError.js';

vi.mock('../src/services/inventory.service.js', () => ({
  InventoryService: {
    adjustStock: vi.fn().mockResolvedValue({}),
    getFifoAllocation: vi.fn().mockResolvedValue([
      { id: 'batch-1', qty: 10 }
    ]),
  },
}));

describe('Outbound Service Logic', () => {
  it('should prevent confirming SO if status is not DRAFT', async () => {
    vi.spyOn(OutboundService, 'getSoById').mockResolvedValueOnce({
      id: 'so-1',
      status: 'CONFIRMED',
      soNumber: 'OUT-202601-0001',
      warehouseId: 'wh-1',
      customerId: 'cus-1',
      notes: null,
      warehouseName: 'Gudang Pusat',
      customerName: 'PT Customer',
      createdAt: new Date(),
      confirmedAt: new Date(),
      lines: [],
    });

    await expect(OutboundService.confirmSo('so-1', 'user-1')).rejects.toThrowError(BadRequestError);
  });

  it('should prevent cancelling SO if status is not DRAFT', async () => {
    vi.spyOn(OutboundService, 'getSoById').mockResolvedValueOnce({
      id: 'so-2',
      status: 'CANCELLED',
      soNumber: 'OUT-202601-0002',
      warehouseId: 'wh-1',
      customerId: 'cus-1',
      notes: null,
      warehouseName: 'Gudang Pusat',
      customerName: 'PT Customer',
      createdAt: new Date(),
      confirmedAt: null,
      lines: [],
    });

    await expect(OutboundService.cancelSo('so-2', 'user-1')).rejects.toThrowError(BadRequestError);
  });
});

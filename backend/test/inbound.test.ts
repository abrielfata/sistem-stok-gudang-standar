import { describe, it, expect, vi } from 'vitest';
import { InboundService } from '../src/services/inbound.service.js';
import { InventoryService } from '../src/services/inventory.service.js';
import { BadRequestError } from '../src/errors/AppError.js';

// Mocking dependencies to avoid hitting the real database
vi.mock('../src/services/inventory.service.js', () => ({
  InventoryService: {
    adjustStock: vi.fn().mockResolvedValue({}),
  },
}));

// Mock InboundService internal methods to test confirmGrn isolated logic
describe('Inbound Service Logic', () => {
  it('should prevent confirming GRN if status is not DRAFT', async () => {
    // Override getGrnById dynamically for this test
    vi.spyOn(InboundService, 'getGrnById').mockResolvedValueOnce({
      id: 'grn-1',
      status: 'CONFIRMED',
      grnNumber: 'IN-202601-0001',
      warehouseId: 'wh-1',
      supplierId: 'sup-1',
      notes: null,
      warehouseName: 'Gudang Pusat',
      supplierName: 'PT Supplier',
      createdAt: new Date(),
      confirmedAt: new Date(),
      lines: [],
    });

    await expect(InboundService.confirmGrn('grn-1', 'user-1')).rejects.toThrowError(BadRequestError);
  });

  it('should prevent cancelling GRN if status is not DRAFT', async () => {
    vi.spyOn(InboundService, 'getGrnById').mockResolvedValueOnce({
      id: 'grn-2',
      status: 'CANCELLED',
      grnNumber: 'IN-202601-0002',
      warehouseId: 'wh-1',
      supplierId: 'sup-1',
      notes: null,
      warehouseName: 'Gudang Pusat',
      supplierName: 'PT Supplier',
      createdAt: new Date(),
      confirmedAt: null,
      lines: [],
    });

    await expect(InboundService.cancelGrn('grn-2', 'user-1')).rejects.toThrowError(BadRequestError);
  });
});

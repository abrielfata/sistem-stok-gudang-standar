import { describe, it, expect, vi } from 'vitest';
import { DashboardService } from '../src/services/dashboard.service.js';
import { AuditService } from '../src/services/audit.service.js';

describe('Dashboard & Audit Service', () => {
  it('should define KPI and activity retrieval functions', () => {
    expect(typeof DashboardService.getKpi).toBe('function');
    expect(typeof DashboardService.getActivity).toBe('function');
  });

  it('should define audit log and list functions', () => {
    expect(typeof AuditService.log).toBe('function');
    expect(typeof AuditService.list).toBe('function');
  });
});

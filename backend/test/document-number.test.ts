import { describe, it, expect } from 'vitest';
import { generateDocumentNumber } from '../src/helpers/document-number.helper.js';

describe('Document Number Generator Helper', () => {
  it('should generate correctly formatted document number', () => {
    const date = new Date(2026, 0, 15); // Jan 15, 2026
    const docNo = generateDocumentNumber('IN', date, 1);
    expect(docNo).toBe('IN-202601-0001');

    const docOut = generateDocumentNumber('OUT', date, 42);
    expect(docOut).toBe('OUT-202601-0042');
  });

  it('should reflect different months correctly', () => {
    const febDate = new Date(2026, 1, 5); // Feb 5, 2026
    const docNo = generateDocumentNumber('IN', febDate, 1);
    expect(docNo).toBe('IN-202602-0001');
  });
});

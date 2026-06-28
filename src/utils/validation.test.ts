import { describe, it, expect } from 'vitest';
import { isValidDateBR, checkValidDateBR, formatBR } from './formatDateToBR';
import { sanitizePostgrestSearch, validateImageFile } from '../lib/validation';

describe('formatDateToBR', () => {
  it('valida data BR correta', () => {
    expect(isValidDateBR('01/01/2000')).toBe(true);
    expect(checkValidDateBR('32/01/2000').valid).toBe(false);
  });

  it('formata ISO para BR', () => {
    expect(formatBR('2000-01-15')).toBe('15/01/2000');
  });
});

describe('validation', () => {
  it('sanitiza caracteres perigosos na busca', () => {
    expect(sanitizePostgrestSearch('João, test')).toBe('João test');
  });

  it('rejeita tipo de arquivo inválido', () => {
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    expect(validateImageFile(file)).toContain('Formato inválido');
  });
});

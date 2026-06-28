import { describe, it, expect } from 'vitest';
import { validarCPF } from './validarCPF';

describe('validarCPF', () => {
  it('rejeita CPF inválido', () => {
    expect(validarCPF('111.111.111-11')).toBe(false);
    expect(validarCPF('123')).toBe(false);
  });

  it('aceita CPF válido conhecido', () => {
    expect(validarCPF('529.982.247-25')).toBe(true);
  });

  it('remove formatação antes de validar', () => {
    expect(validarCPF('52998224725')).toBe(true);
  });
});

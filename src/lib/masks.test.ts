import { describe, it, expect } from 'vitest';
import {
  dataBRParaISO,
  dataISOParaBR,
  isTelefoneValido,
  limparNome,
  maskCPF,
  maskDataBR,
  maskTelefone,
} from './masks';

describe('maskTelefone', () => {
  it('formata celular e fixo', () => {
    expect(maskTelefone('45999998888')).toBe('(45) 99999-8888');
    expect(maskTelefone('4533334444')).toBe('(45) 3333-4444');
  });

  it('descarta o código do país quando colado com +55', () => {
    expect(maskTelefone('+55 45 99999-8888')).toBe('(45) 99999-8888');
  });

  it('é idempotente e formata enquanto digita', () => {
    expect(maskTelefone('(45) 99999-8888')).toBe('(45) 99999-8888');
    expect(maskTelefone('459')).toBe('(45) 9');
  });
});

describe('isTelefoneValido', () => {
  it('aceita 10 ou 11 dígitos e recusa incompletos', () => {
    expect(isTelefoneValido('(45) 99999-8888')).toBe(true);
    expect(isTelefoneValido('(45) 3333-4444')).toBe(true);
    expect(isTelefoneValido('(45) 9999')).toBe(false);
  });
});

describe('maskCPF e maskDataBR', () => {
  it('formata CPF cru e corta excesso', () => {
    expect(maskCPF('18865597089')).toBe('188.655.970-89');
    expect(maskCPF('188655970891234')).toBe('188.655.970-89');
  });

  it('formata data e ignora o que vier depois', () => {
    expect(maskDataBR('21111950')).toBe('21/11/1950');
    expect(maskDataBR('21/11/1950 10:00')).toBe('21/11/1950');
  });
});

describe('conversão de datas', () => {
  it('aceita ISO e dd/MM/aaaa (cadastros antigos)', () => {
    expect(dataISOParaBR('1975-08-25')).toBe('25/08/1975');
    expect(dataISOParaBR('25/08/1975')).toBe('25/08/1975');
    expect(dataBRParaISO('21/11/1950')).toBe('1950-11-21');
  });
});

describe('limparNome', () => {
  it('remove espaços nas pontas e duplicados', () => {
    expect(limparNome('Maria Antonia ')).toBe('Maria Antonia');
    expect(limparNome('  Maria   Antonia  ')).toBe('Maria Antonia');
    expect(limparNome('   ')).toBe('');
    expect(limparNome(null)).toBe('');
  });
});

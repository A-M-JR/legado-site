import { describe, it, expect, vi } from 'vitest';

// O módulo importa o cliente do Supabase; os testes cobrem só funções puras.
vi.mock('@/lib/supabaseClient', () => ({ supabase: {} }));

import {
  linkAgenda,
  linkCompartilhamento,
  linkCoroaFlores,
  mensagemWhatsApp,
  numeroWhatsApp,
  slugNome,
} from './notaFalecimento';

const ID = '69675667-cf41-4324-97c4-4895e80cef7e';

describe('link curto', () => {
  it('gera slug sem acentos e com o código de 8 caracteres', () => {
    expect(slugNome('Maria Antônia da Silva ')).toBe('maria-antonia-da-silva');
    expect(linkCompartilhamento(ID, 'Maria Antonia ')).toBe('https://legadoeconforto.com.br/n/maria-antonia-69675667');
  });

  it('funciona sem nome', () => {
    expect(linkCompartilhamento(ID)).toBe('https://legadoeconforto.com.br/n/69675667');
  });
});

describe('mensagemWhatsApp', () => {
  it('usa *negrito* sem espaço sobrando e o link curto', () => {
    const msg = mensagemWhatsApp({ id: ID, nome: 'Maria Antonia ', falecido: true, data_falecimento: '1950-11-21' });
    expect(msg).toContain('*Maria Antonia* na data 21/11/1950');
    expect(msg).toContain('/n/maria-antonia-69675667');
  });
});

describe('numeroWhatsApp', () => {
  it('normaliza para wa.me com 55', () => {
    expect(numeroWhatsApp('(11) 96569-9834')).toBe('5511965699834');
    expect(numeroWhatsApp('+55 11 96569-9834')).toBe('5511965699834');
    expect(numeroWhatsApp('123')).toBeNull();
  });
});

describe('linkCoroaFlores', () => {
  it('só existe com WhatsApp válido e cita o velório', () => {
    const nota = {
      homenageado_id: ID,
      frase: null,
      whatsapp_flores: '(11) 96569-9834',
      cerimonias: [{ tipo: 'Velório', local: 'Cemitério da Paz', data: '2026-09-27', hora: '10:00' }],
    };
    const link = linkCoroaFlores(nota, 'Sérgio')!;
    expect(link.startsWith('https://wa.me/5511965699834?text=')).toBe(true);
    expect(decodeURIComponent(link)).toContain('Velório em Cemitério da Paz, 27/09/2026 às 10:00');
    expect(linkCoroaFlores({ ...nota, whatsapp_flores: null }, 'Sérgio')).toBeNull();
  });
});

describe('linkAgenda', () => {
  it('cria evento de 2h no fuso de São Paulo', () => {
    const url = new URL(linkAgenda({ tipo: 'Velório', local: 'Cemitério da Paz', data: '2026-09-27', hora: '10:00' }, 'Sérgio')!);
    expect(url.searchParams.get('dates')).toBe('20260927T100000/20260927T120000');
    expect(url.searchParams.get('ctz')).toBe('America/Sao_Paulo');
    expect(url.searchParams.get('text')).toBe('Velório de Sérgio');
  });

  it('sem hora vira evento de dia inteiro; sem data não gera link', () => {
    const url = new URL(linkAgenda({ tipo: 'Missa de 7º dia', local: 'Igreja', data: '2026-10-03' }, 'Sérgio')!);
    expect(url.searchParams.get('dates')).toBe('20261003/20261004');
    expect(linkAgenda({ tipo: 'Velório', local: 'X' }, 'Sérgio')).toBeNull();
  });
});

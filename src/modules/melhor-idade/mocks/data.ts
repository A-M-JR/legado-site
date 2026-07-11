import type { ContatoApoio, Mensagem, Momento, Notificacao, OpcaoApoio, TarefaDia } from "../types";

export const TAREFAS_DIA_MOCK: TarefaDia[] = [
    {
        id: "1",
        tipo: "medicacao",
        titulo: "Medicação",
        descricao: "Próximo horário: 14:00",
        horario: "14:00",
    },
    {
        id: "2",
        tipo: "compromisso",
        titulo: "Compromisso",
        descricao: "Consulta com Dr. Pedro — Hoje às 16:00",
        horario: "16:00",
    },
    {
        id: "3",
        tipo: "cuidado",
        titulo: "Cuidado do dia",
        descricao: "Respire fundo por 2 minutos",
    },
    {
        id: "4",
        tipo: "momento",
        titulo: "Pequeno momento",
        descricao: "Que tal tomar um pouco de sol hoje?",
    },
];

export const MENSAGENS_MOCK: Mensagem[] = [
    {
        id: "1",
        tipo: "audio",
        remetente: "Maria",
        relacao: "Filha",
        horaLabel: "Hoje — 09:15",
        duracao: "0:45",
        lida: false,
    },
    {
        id: "2",
        tipo: "texto",
        remetente: "Carlos",
        relacao: "Amigo(a)",
        horaLabel: "Ontem — 20:30",
        conteudo: "Estive pensando em você!",
        lida: true,
    },
    {
        id: "3",
        tipo: "video",
        remetente: "Ana",
        relacao: "Neta",
        horaLabel: "Ontem — 18:10",
        duracao: "1:20",
        thumbnailUrl:
            "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80",
        lida: true,
    },
];

export const MOMENTOS_MOCK: Momento[] = [
    {
        id: "1",
        tipo: "foto",
        url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=400&q=80",
        favorito: true,
        criadoEm: "2026-02-10",
    },
    {
        id: "2",
        tipo: "foto",
        url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80",
        favorito: false,
        criadoEm: "2026-02-08",
    },
    {
        id: "3",
        tipo: "foto",
        url: "https://images.unsplash.com/photo-1543269664-56d93c1b41a6?auto=format&fit=crop&w=400&q=80",
        favorito: false,
        criadoEm: "2026-02-05",
    },
    {
        id: "4",
        tipo: "foto",
        url: "https://images.unsplash.com/photo-1581579438747-1dc8d6bb29f0?auto=format&fit=crop&w=400&q=80",
        favorito: true,
        criadoEm: "2026-01-28",
    },
];

export const CONTATOS_APOIO_MOCK: ContatoApoio[] = [
    {
        id: "1",
        nome: "Ana (Filha)",
        relacao: "Família",
        fotoUrl:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
        telefone: "11999999999",
        emergencia: true,
    },
    {
        id: "2",
        nome: "Dr. Carlos",
        relacao: "Médico",
        fotoUrl:
            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&q=80",
        emergencia: true,
    },
    {
        id: "3",
        nome: "Maria Cuidadora",
        relacao: "Equipe",
        fotoUrl:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
        emergencia: false,
    },
];

export const NOTIFICACOES_MOCK: Notificacao[] = [
    {
        id: "1",
        titulo: "Nova mensagem de Maria",
        descricao: "Maria (Filha) enviou um áudio para você.",
        horaLabel: "Hoje — 09:15",
        tipo: "mensagem",
        lida: false,
        link: "/melhor-idade/mensagens",
    },
    {
        id: "2",
        titulo: "Hora do remédio",
        descricao: "Lembrete: medicação às 14:00.",
        horaLabel: "Hoje — 13:45",
        tipo: "medicacao",
        lida: false,
        link: "/melhor-idade/meu-dia",
    },
    {
        id: "3",
        titulo: "Consulta hoje",
        descricao: "Consulta com Dr. Pedro às 16:00.",
        horaLabel: "Hoje — 08:00",
        tipo: "consulta",
        lida: false,
        link: "/melhor-idade/meu-dia",
    },
    {
        id: "4",
        titulo: "Cuidado registrado",
        descricao: "Maria marcou o café da manhã como concluído.",
        horaLabel: "Ontem — 08:35",
        tipo: "cuidado",
        lida: true,
        link: "/melhor-idade/agenda",
    },
    {
        id: "5",
        titulo: "Bem-vindo ao Melhor Idade",
        descricao: "Explore suas jornadas de cuidado com carinho.",
        horaLabel: "Ontem — 10:00",
        tipo: "sistema",
        lida: true,
    },
];

export const OPCOES_APOIO_MOCK: OpcaoApoio[] = [
    {
        id: "1",
        titulo: "Falar com família",
        descricao: "Ligue ou chame alguém de confiança.",
        icone: "familia",
    },
    {
        id: "2",
        titulo: "Falar com a equipe",
        descricao: "Converse com nossa equipe de apoio.",
        icone: "equipe",
    },
    {
        id: "3",
        titulo: "Exercício rápido",
        descricao: "Respiração e acolhimento para o momento.",
        icone: "exercicio",
    },
];

export type HumorTipo = "bem" | "mais_ou_menos" | "precisa_apoio";

export interface PessoaRede {
    id: string;
    nome: string;
    relacao: string;
    fotoUrl?: string;
}

export interface MiProfile {
    onboardingComplete: boolean;
    nome: string;
    fotoUrl?: string;
    rede: PessoaRede[];
    humorAtual?: HumorTipo;
    humorAtualizadoEm?: string;
}

export type TarefaDiaTipo = "medicacao" | "compromisso" | "cuidado" | "momento";

export interface TarefaDia {
    id: string;
    tipo: TarefaDiaTipo;
    titulo: string;
    descricao: string;
    horario?: string;
    feito?: boolean;
}

export type MensagemTipo = "texto" | "audio" | "video";

export interface Mensagem {
    id: string;
    tipo: MensagemTipo;
    remetente: string;
    relacao: string;
    horaLabel: string;
    conteudo?: string;
    duracao?: string;
    thumbnailUrl?: string;
    audioUrl?: string;
    lida: boolean;
}

export interface Momento {
    id: string;
    tipo: "foto" | "video";
    url: string;
    favorito: boolean;
    criadoEm: string;
}

export interface ContatoApoio {
    id: string;
    nome: string;
    relacao: string;
    fotoUrl: string;
    telefone?: string;
    emergencia: boolean;
}

export interface OpcaoApoio {
    id: string;
    titulo: string;
    descricao: string;
    icone: "familia" | "equipe" | "exercicio";
}

export interface RegistroSaude {
    id: string;
    tipo: string;
    value: string;
    unit: string;
    timeLabel: string;
    note: string;
}

export interface ReceitaMedica {
    id: string;
    medicamento: string;
    dosagem: string;
    frequencia: string;
    inicio: string;
    validade: string;
    medico: string;
    especialidade: string;
    data_consulta: string;
    foto_url?: string;
    ativa?: boolean;
    observacoes?: string;
}

export interface ConsultaMedica {
    id: string;
    data: string;
    medico: string;
    local?: string;
    tipo?: string;
}

export type CuidadoTipo = "remedio" | "comida" | "higiene" | "atividade";
export type CuidadoPeriodo = "manha" | "tarde" | "noite";

export interface CuidadoTarefa {
    id: string;
    hora: string;
    titulo: string;
    desc?: string;
    tipo: CuidadoTipo;
    feito: boolean;
    periodo: CuidadoPeriodo;
    responsavel?: string;
}

export type NotificacaoTipo = "mensagem" | "medicacao" | "consulta" | "cuidado" | "sistema";

export interface Notificacao {
    id: string;
    titulo: string;
    descricao: string;
    horaLabel: string;
    tipo: NotificacaoTipo;
    lida: boolean;
    link?: string;
}

export interface HistoriaEntrada {
    id: string;
    titulo: string;
    conteudo: string;
    privado: boolean;
    mediaUrl?: string;
    mediaTipo?: "foto" | "video";
    criadoEm: string;
}

export interface FamiliaMemoria {
    id: string;
    pessoaId: string;
    mensagem: string;
    remetente: string;
    anonimo: boolean;
    mediaUrl?: string;
    mediaTipo?: "foto" | "video";
    criadoEm: string;
}

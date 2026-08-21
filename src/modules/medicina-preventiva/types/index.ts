export type RotinaTipo =
    | "medicacao"
    | "exercicio"
    | "hidratacao"
    | "medicao"
    | "alimentacao"
    | "jejum"
    | "outro";

export type RotinaPeriodo = "manha" | "tarde" | "noite";

export interface RotinaItem {
    id: string;
    hora: string;
    titulo: string;
    descricao: string;
    tipo: RotinaTipo;
    periodo: RotinaPeriodo;
    valorAlvo: string;
    unidadeMedida: string;
    responsavel?: string;
    feito: boolean;
}

export interface ReceitaMp {
    id: string;
    medicamento: string;
    dosagem: string;
    frequencia: string;
    inicio: string;
    validade: string;
    medico: string;
    especialidade: string;
    dataConsulta: string;
    fotoUrl?: string;
    ativa: boolean;
    observacoes: string;
}

export type ConsultaStatus =
    | "agendada"
    | "confirmada"
    | "realizada"
    | "cancelada"
    | "faltou";

export type ConsultaTipo = "presencial" | "online" | "retorno" | "exame";

export interface ConsultaMp {
    id: string;
    titularId: string;
    dataHora: string;
    profissional: string;
    especialidade: string;
    local: string;
    tipo: ConsultaTipo;
    observacoes: string;
    status: ConsultaStatus;
    origem: "paciente" | "clinica";
    unidadeId?: string | null;
    pacienteNome?: string;
}

export type ExameStatus =
    | "solicitado"
    | "agendado"
    | "realizado"
    | "resultado_disponivel"
    | "cancelado";

export type ExameTipo = "laboratorial" | "imagem" | "outro";

export interface ExameArquivo {
    path: string;
    nome: string;
    mime: string;
    tamanho?: number;
}

export interface ExameMp {
    id: string;
    titularId: string;
    nomeExame: string;
    tipo: ExameTipo;
    medicoSolicitante: string;
    especialidade: string;
    laboratorio: string;
    dataSolicitacao: string;
    dataHoraAgendada: string;
    dataRealizacao: string;
    status: ExameStatus;
    resultadoResumo: string;
    observacoes: string;
    arquivos: ExameArquivo[];
    origem: "paciente" | "clinica";
    pacienteNome?: string;
}

export interface SintomaCatalogo {
    id: string;
    nome: string;
    descricao: string;
    categoria: string;
    gravidadePadrao: "baixa" | "media" | "alta";
    ativo: boolean;
    ordem: number;
}

export type SintomaIntensidade = "leve" | "media" | "forte";

export type SintomaStatus = "novo" | "em_analise" | "respondido" | "arquivado";

export interface SintomaSelecionado {
    id: string;
    nome: string;
}

export interface RegistroSintoma {
    id: string;
    titularId: string;
    sintomas: SintomaSelecionado[];
    intensidade: SintomaIntensidade;
    observacao: string;
    fotoUrl?: string;
    status: SintomaStatus;
    whatsappEnviado: boolean;
    unidadeId?: string | null;
    criadoEm: string;
    pacienteNome?: string;
}

export type MpNotificacaoTipo =
    | "consulta"
    | "exame"
    | "sintoma"
    | "receita"
    | "rotina"
    | "sistema";

export interface MpNotificacao {
    id: string;
    titulo: string;
    descricao: string;
    horaLabel: string;
    tipo: MpNotificacaoTipo;
    lida: boolean;
    link?: string;
}

export interface Unidade {
    id: string;
    parceiroId: string;
    nome: string;
    whatsappNumero: string;
    telefone: string;
    endereco: string;
    ativo: boolean;
    ordem: number;
}

export interface PessoaRede {
    id: string;
    nome: string;
    relacao: string;
    fotoUrl?: string;
    ordem: number;
}

export interface FamiliaMensagem {
    id: string;
    pessoaId: string;
    mensagem: string;
    remetente: string;
    anonimo: boolean;
    mediaUrl?: string;
    mediaTipo?: "foto" | "video";
    criadoEm: string;
}

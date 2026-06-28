import { CONTATOS_APOIO_MOCK, OPCOES_APOIO_MOCK } from "../mocks/data";

export const apoioService = {
    listContatos() {
        return CONTATOS_APOIO_MOCK;
    },

    listOpcoes() {
        return OPCOES_APOIO_MOCK;
    },
};

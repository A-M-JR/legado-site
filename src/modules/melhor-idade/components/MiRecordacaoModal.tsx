import { useState } from "react";
import RecordacaoForm, { type HomenageadoInfo } from "@/components/recordacoes/RecordacaoForm";
import { MiDemoModal } from "./MiDemoModal";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    person: HomenageadoInfo;
    onSubmit: (data: {
        mensagem: string;
        nome: string;
        anonimo: boolean;
        file: File | null;
    }) => Promise<void>;
};

export function MiRecordacaoModal({ open, onOpenChange, person, onSubmit }: Props) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(data: {
        mensagem: string;
        nome: string;
        anonimo: boolean;
        file: File | null;
    }) {
        setLoading(true);
        try {
            await onSubmit(data);
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    }

    return (
        <MiDemoModal
            open={open}
            onOpenChange={onOpenChange}
            title="Deixe sua recordação 💙"
            description={`Mensagem carinhosa para ${person.nome}`}
            className="sm:max-w-xl"
        >
            <RecordacaoForm
                person={person}
                embedded
                loading={loading}
                onSubmit={handleSubmit}
            />
        </MiDemoModal>
    );
}

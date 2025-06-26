import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import "@/styles/legado-app.css"

export default function NovoTitular() {
    const [nome, setNome] = useState("")
    const [telefone, setTelefone] = useState("")
    const [cpf, setCpf] = useState("")
    const [dataNascimento, setDataNascimento] = useState("")
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [imagem, setImagem] = useState<File | null>(null)
    const [isMestre, setIsMestre] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Criação do usuário, se for mestre
        let userId = ""
        if (isMestre) {
            const { data, error } = await supabase.auth.signUp({
                email,
                password: senha,
            })
            if (error || !data.user) {
                alert("Erro ao criar usuário mestre: " + error?.message)
                setLoading(false)
                return
            }
            userId = data.user.id
        } else {
            const { data: session } = await supabase.auth.getUser()
            if (!session?.user?.id) {
                alert("Você precisa estar logado para criar um titular.")
                setLoading(false)
                return
            }
            userId = session.user.id
        }

        // Upload da imagem se houver
        let imagemUrl = null
        if (imagem) {
            const filename = `${Date.now()}-${imagem.name}`
            const { data, error } = await supabase.storage
                .from("dependentes")
                .upload(`perfil/${filename}`, imagem)

            if (error) {
                alert("Erro ao enviar imagem: " + error.message)
            } else {
                const url = supabase.storage.from("dependentes").getPublicUrl(`perfil/${filename}`)
                imagemUrl = url.data.publicUrl
            }
        }

        const { error: insertError } = await supabase.from("titulares").insert({
            nome,
            telefone,
            cpf,
            data_nascimento: dataNascimento,
            imagem_url: imagemUrl,
            usuario_mestre: isMestre,
            email: isMestre ? email : null,
            auth_id: userId,
        })

        if (insertError) {
            alert("Erro ao salvar titular: " + insertError.message)
        } else {
            alert("Titular cadastrado com sucesso!")
        }

        setLoading(false)
    }

    return (
        <div className="legado-app-wrapper py-10 px-4 max-w-xl mx-auto">
            <div className="legado-form-card">
                <h2 className="text-xl font-bold mb-4 text-center">Cadastro de Titular</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label>Nome</label>
                        <input className="legado-input" value={nome} onChange={(e) => setNome(e.target.value)} />
                    </div>
                    <div>
                        <label>Telefone</label>
                        <input className="legado-input" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
                    </div>
                    <div>
                        <label>CPF</label>
                        <input className="legado-input" value={cpf} onChange={(e) => setCpf(e.target.value)} />
                    </div>
                    <div>
                        <label>Data de nascimento</label>
                        <input
                            type="date"
                            className="legado-input"
                            value={dataNascimento}
                            onChange={(e) => setDataNascimento(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Imagem (opcional)</label>
                        <input type="file" onChange={(e) => setImagem(e.target.files?.[0] || null)} />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={isMestre}
                            onChange={(e) => setIsMestre(e.target.checked)}
                        />
                        <label>Usuário Mestre</label>
                    </div>

                    {isMestre && (
                        <>
                            <div>
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="legado-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Senha</label>
                                <input
                                    type="password"
                                    className="legado-input"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <button className="legado-button w-full" disabled={loading}>
                        {loading ? "Salvando..." : "Cadastrar"}
                    </button>
                </form>
            </div>
        </div>
    )
}

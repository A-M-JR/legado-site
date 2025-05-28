import React from 'react';

const PrivacyPolicy = () => {
    return (
        <section className="py-24 bg-legado-mid bg-opacity-10">
            <div className="container mx-auto px-6 lg:px-16 max-w-4xl">
                <h1 className="text-4xl font-serif font-bold text-legado-dark mb-8 text-center">
                    Política de Privacidade
                </h1>

                <p className="text-legado-dark text-base leading-relaxed mb-6 text-justify">
                    No APP Legado, sua privacidade é nossa prioridade. Esta política explica como coletamos, usamos e protegemos suas informações pessoais para garantir uma experiência segura e respeitosa.
                </p>

                <h2 className="text-2xl font-semibold text-legado-dark mb-4">1. Dados que coletamos</h2>
                <p className="text-legado-dark text-base leading-relaxed mb-6 text-justify">
                    Coletamos apenas os dados essenciais para o funcionamento do app e para que você possa preservar as memórias dos seus entes queridos, como:
                </p>
                <ul className="list-disc list-inside text-legado-dark mb-6">
                    <li>Informações de cadastro: nome, e-mail, telefone;</li>
                    <li>Dados das memórias compartilhadas: fotos, vídeos, textos;</li>
                    <li>Dados técnicos de uso para garantir segurança e desempenho do app.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-legado-dark mb-4">2. Como usamos seus dados</h2>
                <p className="text-legado-dark text-base leading-relaxed mb-6 text-justify">
                    Os dados são utilizados exclusivamente para oferecer os serviços do APP Legado, incluindo:
                </p>
                <ul className="list-disc list-inside text-legado-dark mb-6">
                    <li>Permitir o acesso e controle das memórias digitais;</li>
                    <li>Garantir a segurança e privacidade do seu conteúdo;</li>
                    <li>Personalizar sua experiência conforme suas preferências;</li>
                    <li>Comunicar atualizações importantes e suporte.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-legado-dark mb-4">3. Compartilhamento de dados</h2>
                <p className="text-legado-dark text-base leading-relaxed mb-6 text-justify">
                    Não compartilhamos suas informações pessoais com terceiros, exceto quando obrigatório por lei ou para proteger direitos legais. Seu conteúdo e dados permanecem privados e acessíveis apenas por você e seus dependentes autorizados.
                </p>

                <h2 className="text-2xl font-semibold text-legado-dark mb-4">4. Segurança dos dados</h2>
                <p className="text-legado-dark text-base leading-relaxed mb-6 text-justify">
                    Adotamos práticas rigorosas de segurança para proteger seus dados contra acessos não autorizados, perda ou alteração, usando tecnologias modernas e protocolos seguros.
                </p>

                <h2 className="text-2xl font-semibold text-legado-dark mb-4">5. Seus direitos</h2>
                <p className="text-legado-dark text-base leading-relaxed mb-6 text-justify">
                    Você pode acessar, corrigir ou solicitar a exclusão dos seus dados a qualquer momento pelo próprio aplicativo ou entrando em contato conosco. Valorizamos sua privacidade e respeitamos suas escolhas.
                </p>

                <h2 className="text-2xl font-semibold text-legado-dark mb-4">6. Contato</h2>
                <p className="text-legado-dark text-base leading-relaxed text-justify">
                    Para dúvidas ou solicitações relacionadas à privacidade, envie um e-mail para <a href="mailto:contato@legadoeconforto.com.br" className="text-legado-gold underline">contato@legadoeconforto.com.br</a>.
                </p>

                <p className="text-legado-dark text-sm mt-12 text-center">
                    Última atualização: 27 de maio de 2025
                </p>
            </div>
        </section>
    );
};

export default PrivacyPolicy;

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import About from '../../components/About';
import PathSelector from '../../components/PathSelector';
import PillarContent from '../../components/PillarContent';
import PartnerSection from '../../components/PartnerSection';
import FAQ from '../../components/FAQ';
import Footer from '../../components/Footer';
import WhatsAppButton from '../../components/WhatsAppButton';

const PILLAR_DATA = {
  luto: {
    id: 'luto',
    pillarTitle: 'LUTO',
    introText: '🖤 Estou vivendo um momento sensível de luto – SOU FAMILIA. Você precisa de apoio, não de mais peso. Nós cuidamos da memória, da organização e do acolhimento — para que você possa cuidar do que realmente importa.',
    headline: 'Você não precisa ser forte o tempo todo.',
    subheadline: 'Nos momentos mais difíceis, o que você mais precisa é de apoio, acolhimento e organização. O ILC está com você.',
    problemTitle: <>O que você está sentindo<br />(e nós entendemos )</>,
    problems: [
      'Sensação de vazio e desorganização',
      'Dificuldade de lidar com tudo ao mesmo tempo',
      'Medo de esquecer detalhes importantes',
      'Falta de apoio verdadeiro'
    ],
    solutionTitle: 'O que você encontra aqui',
    solutions: [
      'Um espaço seguro para guardar memórias, fotos e histórias',
      'Um ambiente de homenagem para quem você ama',
      'Apoio emocional no processo do luto de profissionais especializados',
      'Organização de informações importantes da família',
      'Espaço para receber mensagens e homenagens de amigos',
      'Diário do luto – onde você pode ser quem você é e sentir seja o que for sem medo de julgamentos',
      'Arquivo de fotos e vídeos sem ocupar espaço no seu celular'
    ],
    changesTitle: 'O que isso muda na sua vida',
    changes: [
      'Você não se sente sozinho',
      'Você não precisa lidar com tudo ao mesmo tempo',
      'Você mantém viva a história de quem ama',
      'Você traz mais leveza para um momento difícil'
    ],
    benefitsTitle: 'Benefícios',
    benefits: [
      'Acolhimento emocional contínuo',
      'Organização documental familiar',
      'Preservação do legado digital'
    ],
    forWhoTitle: 'Para quem é',
    forWho: [
      'Para quem perdeu alguém e precisa de acolhimento',
      'Para quem está vivendo um processo de despedida',
      'Para quem quer cuidar da família com antecedência'
    ],
    ctas: [
      { text: 'CRIAR MEU ESPAÇO NO ILC', wppMessage: 'Olá, gostaria de criar meu espaço no ILC para apoio ao luto. Quero preencher o formulário.' }
    ],
    testimonials: [
      { text: 'Perder meu marido me deixou completamente perdida. O Legado foi o único lugar onde eu consegui organizar o que eu sentia sem me sentir julgada. Hoje eu consigo lembrar dele com amor, não só com dor.', author: 'Ana Paula', sub: '52 anos' },
      { text: 'Não era terapia… era acolhimento de verdade. Eu já tinha tentado outras coisas, mas nada me fez sentir tão compreendida.', author: 'Marcos', sub: '47 anos' },
      { text: 'Me ajudou a não me sentir sozinho. O pior do luto é o silêncio. Aqui eu senti que tinha um lugar pra mim, todos os dias.', author: 'Roberto', sub: '61 anos' },
      { text: 'Transformei a dor em memória viva. Eu consegui guardar momentos do meu filho de uma forma linda.', author: 'Juliana', sub: '39 anos' },
      { text: 'Eu voltei a respirar. Nos primeiros dias eu nem sabia por onde começar. O Legado me deu pequenos passos… e isso fez toda a diferença.', author: 'Carla', sub: '45 anos' }
    ]
  },
  idoso: {
    id: 'idoso',
    pillarTitle: 'IDOSO – VIVA 60+',
    headline: 'Envelhecer com autonomia também é continuar sendo cuidado com presença.',
    subheadline: 'O ILC ajuda idosos e famílias a manterem organização, vínculo e segurança emocional através de uma experiência humanizada de cuidado contínuo.',
    problemTitle: 'Desafios reais',
    problems: [
      'Solidão',
      'Desorganização',
      'Distância familiar',
      'Dependência emocional'
    ],
    solutionTitle: 'O que o ILC te entrega',
    solutions: [
      'Organização da rotina de cuidado',
      'Conteúdos de apoio e orientação',
      'Mais segurança e organização da rotina de cuidado – tenha todas as informações das suas consultas e retornos',
      'Histórias e momentos compartilhados: Espaço para guardar fotos e vídeos sem ocupar espaço no seu celular'
    ],
    changesTitle: 'Como o ILC ajuda',
    changes: [
      'Organização de dados importantes (consultas, médicos, receitas, remédios)',
      'Suporte para acompanhamento familiar',
      'Ferramentas para mais segurança e controle da rotina',
      'Estrutura para planejamento e cuidado contínuo'
    ],
    benefitsTitle: 'Benefícios',
    benefits: [
      'Mais tranquilidade para a família (você e familiares podem acessar a qualquer momento)',
      'Mais independência para o idoso',
      'Mais segurança e praticidade no dia a dia'
    ],
    forWhoTitle: 'Para quem é',
    forWho: [
      'Idosos que buscam manter sua autonomia e segurança',
      'Famílias que desejam acompanhar o idoso com dignidade',
      'Pessoas que valorizam a organização da saúde na melhor idade'
    ],
    ctas: [
      { text: 'SOU IDOSO E QUERO MAIS AUTONOMIA', wppMessage: 'Olá, sou idoso e tenho interesse em ter mais autonomia com o ILC. Gostaria de receber o formulário de atendimento.' },
      { text: 'QUERO ACOMPANHAR MELHOR MEU IDOSO', wppMessage: 'Olá, quero acompanhar melhor meu familiar idoso através do ILC. Gostaria de receber o formulário de atendimento.' }
    ],
    testimonials: [
      { text: 'Agora minha família está mais perto, mesmo longe. Eu falo com meus filhos todos os dias pelo aplicativo.', author: 'José', sub: '74 anos' },
      { text: 'Antes eu passava dias sem falar com ninguém. Hoje sempre tem uma mensagem, um áudio… isso muda tudo.', author: 'Antônio', sub: '68 anos' },
      { text: 'Ficou fácil de usar, até pra mim. O aplicativo é simples, eu consigo ver tudo sem me perder.', author: 'Maria Helena', sub: '71 anos' },
      { text: 'Me ajudou a cuidar da minha saúde sem confusão. Agora eu sei meus horários, minhas consultas…', author: 'João Carlos', sub: '66 anos' },
      { text: 'Eu voltei a ter momentos felizes. Ver fotos da família, receber vídeos… faz um bem enorme.', author: 'Lourdes', sub: '73 anos' }
    ],
    corporate: {
      title: 'Para minha empresa',
      intro: <>O cuidado não termina nas necessidades básicas.<br />O idoso também precisa de presença, autonomia e vínculo.<br /><br />O ILC ajuda instituições de cuidado a oferecerem uma experiência mais humana, organizada e acolhedora — fortalecendo a conexão entre idosos, famílias e equipe.</>,
      challengesTitle: 'O desafio das instituições hoje',
      challenges: [
        'Rotina excessivamente operacional',
        'Dificuldade em manter famílias próximas',
        'Idosos emocionalmente isolados',
        'Sobrecarga da equipe de cuidado',
        'Pouca valorização das histórias e memórias do idoso',
        'Falta de diferenciação entre instituições',
        'Comunicação descentralizada com familiares',
        'Perda da autonomia emocional e social do residente'
      ],
      solutionsTitle: 'O que o ILC ajuda sua instituição a oferecer',
      solutions: [
        'Memorial digital do idoso',
        'Aproximação familiar contínua',
        'Registro de memórias, histórias e afetos',
        'Comunicação mais humanizada',
        'Organização documental e informações centralizadas',
        'Mais autonomia e protagonismo para o idoso',
        'Experiência de cuidado mais acolhedora',
        'Diferenciação emocional da instituição'
      ],
      middleTexts: [
        {
          text: <><strong>Mais do que assistência.<br />Um cuidado que preserva identidade.</strong><br /><br />O ILC transforma informações em presença, lembranças em conexão e tecnologia em acolhimento.<br />Porque envelhecer com dignidade também significa continuar sendo visto, ouvido e lembrado.</>
        },
        {
          title: 'Autonomia também é cuidado',
          text: <>Mesmo dentro de instituições, o idoso precisa continuar exercendo sua individualidade, suas preferências e sua história.<br />Com o ILC, a família participa mais, a equipe compreende melhor cada residente e o idoso mantém viva sua identidade.</>
        }
      ],
      benefitsTitle: 'Benefícios para a instituição',
      benefits: [
        'Fortalece a confiança das famílias',
        'Gera percepção de cuidado premium',
        'Humaniza o relacionamento institucional',
        'Facilita processos internos',
        'Valoriza o trabalho da equipe',
        'Aumenta diferenciação no mercado'
      ],
      footerText: <>Cuidar do idoso também é preservar quem ele é.<br />Conheça como o ILC ajuda instituições a transformarem cuidado em conexão real.</>
    }
  },
  paliativo: {
    id: 'paliativo',
    pillarTitle: 'PALIATIVO – CUIDADO QUE ACOMPANHA',
    introText: '🌿 "O que é o Cuidado que acompanha?" Um espaço onde o paciente e a família se mantêm conectados, organizados e acolhidos — todos os dias. Sem peso, sem linguagem de fim — só vida acontecendo agora.',
    headline: 'Cuidar também é trazer conforto, dignidade e presença.',
    subheadline: 'O ILC apoia pacientes e famílias em momentos de transição, ajudando a organizar, acolher e aliviar.',
    problemTitle: 'O momento que você está vivendo',
    problems: [
      'Decisões difíceis e peso emocional',
      'Emoções intensas e necessidade de presença',
      'Necessidade de organização em momentos delicados',
      'Desejo de oferecer o melhor cuidado possível'
    ],
    solutionTitle: 'O que entregamos ao paciente',
    solutions: [
      'Organização de informações importantes',
      'Check-in do dia – como estou hoje',
      'Meu dia – Ação prática',
      'Mensagens que abraçam – áudios e msg da família e amigos',
      'Memórias vivas – Fotos, vídeos, momentos organizados',
      'Meu diário – áudios ou escrita ou fotos do paciente',
      'Agenda médica – consultas e remédios',
      'Trilha de acolhimento – exercícios diários'
    ],
    changesTitle: 'O que isso proporciona',
    changes: [
      'Mais presença e menos sobrecarga',
      'Mais conexão e menos caos',
      'Mais dignidade no cuidado'
    ],
    benefitsTitle: 'Visão da Família',
    benefits: [
      'Como ele está hoje – check-in',
      'Agenda médica',
      'Possibilidade de enviar msg rápida',
      'Comunicação facilitada: Botões prontos ("Te amo", "Pensando em você")'
    ],
    forWhoTitle: 'Para quem é',
    forWho: [
      'Famílias que passam por momentos delicados e precisam de suporte',
      'Pacientes que buscam manter conexão e dignidade',
      'Quem deseja um sistema de presença emocional + cuidado leve'
    ],
    ctas: [
      { text: 'SOU PACIENTE E QUERO APOIO', wppMessage: 'Olá, sou paciente em cuidados paliativos e gostaria de receber o apoio do ILC. Quero preencher o formulário.' },
      { text: 'SOU FAMILIAR E QUERO APOIO', wppMessage: 'Olá, sou familiar e busco apoio em cuidados paliativos pelo ILC. Quero preencher o formulário.' }
    ],
    testimonials: [
      { text: 'Com o app, eu continuo falando com meus amigos… isso me ajuda a não esquecer quem eu sou.', author: 'Rafael', sub: '17 anos' },
      { text: 'Eu achei que tudo tinha acabado. Mas o Legado me mostrou que ainda existem momentos, ainda existem dias bons.', author: 'Ricardo', sub: '59 anos' },
      { text: 'Eu achei que minha vida tinha pausado… O Legado me ajudou a voltar para o presente. Vivo um dia de cada vez.', author: 'Lucas', sub: '28 anos' },
      { text: 'As mensagens, os áudios… eu comecei a sentir eles mais perto de mim, mesmo quando não estavam aqui.', author: 'Helena', sub: '64 anos' },
      { text: 'Eu não queria que meus filhos me vissem só como alguém doente. Consegui registrar momentos e viver com eles de forma presente.', author: 'Fernanda', sub: '35 anos' },
      { text: 'O app ajudou minha família a saber como estar comigo. Isso tirou um peso enorme de mim.', author: 'Paulo', sub: '70 anos' },
      { text: 'Eu não queria falar sobre doença. Eu queria viver. E foi isso que encontrei aqui. Conversas, risadas… coisas que me lembraram que ainda sou eu.', author: 'Camila', sub: '22 anos' },
      { text: 'Um áudio, uma foto, uma lembrança… isso virou o melhor do meu dia.', author: 'Teresa', sub: '62 anos' },
      { text: 'Agora eu acordo e penso: o que eu posso viver hoje? E isso muda tudo.', author: 'Fernando', sub: '67 anos' }
    ],
    corporate: {
      title: 'Para minha empresa',
      intro: <>Nos cuidados paliativos, cada momento importa.<br />E cada vínculo também.<br /><br />O ILC ajuda hospitais e clínicas a oferecerem um cuidado mais humano, acolhedor e conectado — apoiando pacientes, familiares e equipes durante toda a jornada.</>,
      challengesTitle: 'O desafio enfrentado hoje',
      challenges: [
        'Famílias emocionalmente sobrecarregadas',
        'Comunicação difícil em momentos delicados',
        'Sensação de solidão do paciente',
        'Equipes focadas em demandas operacionais',
        'Falta de organização emocional e documental',
        'Dificuldade em preservar memórias e histórias',
        'Famílias perdidas durante o processo de cuidado',
        'Pouco suporte contínuo ao cuidador principal'
      ],
      solutionsTitle: 'O que o ILC ajuda sua instituição a oferecer',
      solutions: [
        'Acolhimento emocional contínuo',
        'Memorial digital e legado afetivo',
        'Organização documental familiar',
        'Comunicação mais humanizada',
        'Espaço para registros, histórias e mensagens',
        'Apoio ao cuidador e à família',
        'Preservação da identidade e memória do paciente',
        'Experiência de cuidado mais sensível e completa'
      ],
      middleTexts: [
        {
          text: <><strong>O cuidado vai além do tratamento.</strong><br /><br />Em cuidados paliativos, presença, escuta e conexão fazem diferença real na experiência do paciente e da família.<br />O ILC ajuda sua instituição a transformar cuidado em acolhimento verdadeiro.</>
        },
        {
          title: 'Mais dignidade para quem vive o processo',
          text: <>O paciente continua sendo reconhecido pela sua história, afetos e trajetória.<br />A família encontra suporte, organização e um espaço seguro para preservar lembranças, mensagens e conexões importantes.</>
        }
      ],
      benefitsTitle: 'Benefícios para hospitais e clínicas',
      benefits: [
        'Humaniza a experiência do paciente',
        'Fortalece vínculo com as famílias',
        'Diferencia a instituição no cuidado paliativo',
        'Amplia percepção de acolhimento',
        'Apoia a jornada emocional do cuidado',
        'Valoriza o trabalho da equipe multiprofissional'
      ],
      footerText: <>Cuidar também é oferecer conforto emocional, presença e memória.<br />Descubra como o ILC ajuda instituições a levarem mais humanidade para os cuidados paliativos.</>
    }
  }
};

export default function Home() {
  const [selectedPath, setSelectedPath] = useState<'luto' | 'idoso' | 'paliativo' | null>(null);

  useEffect(() => {
    const updateMetaTags = () => {
      document.title = "ILC - Instituto Legado e Conforto";

      let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }

      if (metaDescription) {
        metaDescription.content =
          'O ILC (Instituto Legado e Conforto) existe para acolher, organizar e dar continuidade aos vínculos mais importantes da vida — no LUTO, nos CUIDADOS PALIATIVOS e na AUTONOMIA DO IDOSO.';
      }
    };

    updateMetaTags();
  }, []);

  const handlePathSelect = (path: 'luto' | 'idoso' | 'paliativo') => {
    setSelectedPath(path);
    setTimeout(() => {
      const element = document.getElementById(`section-${path}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="font-sans">
      <Navbar />
      <Hero />
      <About />
      <PathSelector onSelect={handlePathSelect} selectedPath={selectedPath} />
      
      {selectedPath && (
        <PillarContent data={PILLAR_DATA[selectedPath]} />
      )}

      <FAQ />
      <PartnerSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

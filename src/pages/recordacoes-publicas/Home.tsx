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
    problemTitle: 'O que você está sentindo (e nós entendemos)',
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
    ctaText: 'CRIAR MEU ESPAÇO NO ILC',
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
    headline: 'Cuidar da autonomia é cuidar da dignidade.',
    subheadline: 'O ILC ajuda você e sua família a manter organização, segurança e qualidade de vida na melhor fase da experiência.',
    problemTitle: 'Desafios que você pode estar enfrentando',
    problems: [
      'Preocupação com segurança digital e medo',
      'Falta de organização de informações sobre sua vida médica',
      'Medo de imprevistos',
      'Sobrecarga familiar – ter que pedir ajuda para tudo'
    ],
    solutionTitle: 'O que o ILC te entrega',
    solutions: [
      'Minha agenda: Organização de informações importantes',
      'Vídeos de cuidados com o idoso / auto ajuda',
      'Meus Registros de consultas – tenha todas as informações das suas consultas e retornos',
      'Meus registros de receitas – veja o registro das receitas e medicamentos que você utiliza',
      'Diversão: Espaço para guardar fotos e vídeos sem ocupar espaço no seu celular'
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
    ctaText: 'QUERO CUIDAR MELHOR',
    testimonials: [
      { text: 'Agora minha família está mais perto, mesmo longe. Eu falo com meus filhos todos os dias pelo aplicativo.', author: 'José', sub: '74 anos' },
      { text: 'Antes eu passava dias sem falar com ninguém. Hoje sempre tem uma mensagem, um áudio… isso muda tudo.', author: 'Antônio', sub: '68 anos' },
      { text: 'Ficou fácil de usar, até pra mim. O aplicativo é simples, eu consigo ver tudo sem me perder.', author: 'Maria Helena', sub: '71 anos' },
      { text: 'Me ajudou a cuidar da minha saúde sem confusão. Agora eu sei meus horários, minhas consultas…', author: 'João Carlos', sub: '66 anos' },
      { text: 'Eu voltei a ter momentos felizes. Ver fotos da família, receber vídeos… faz um bem enorme.', author: 'Lourdes', sub: '73 anos' }
    ]
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
    solutionTitle: 'Visão do paciente',
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
    ctaText: 'QUERO APOIO AGORA',
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
    ]
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

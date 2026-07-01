import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from "./components/ThemeProvider"
import PrivateRoute from './components/PrivateRoute'
import { Toaster } from "@/components/ui/toaster";

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="h-10 w-10 border-4 border-legado-primary/30 border-t-legado-primary rounded-full animate-spin" />
  </div>
);

const Home = lazy(() => import('./pages/recordacoes-publicas/Home'))
const RecordacaoPublica = lazy(() => import('./pages/recordacoes-publicas/[id]'))
const Sucesso = lazy(() => import('./pages/recordacoes-publicas/sucesso'))
const ConsultaRecordacao = lazy(() => import('./pages/consulta-recordacao'))
const Privacidade = lazy(() => import('./pages/privacidade'))
const Login = lazy(() => import('./pages/legado-app/login'))
const RedefinirSenha = lazy(() => import('./pages/legado-app/redefinir-senha'))
const MenuPage = lazy(() => import('./pages/legado-app/menu/page'))
const CadastroTitular = lazy(() => import('./pages/legado-app/titulares/novo'))
const EditarTitularPage = lazy(() => import("./pages/legado-app/titulares/editar"))
const EditarDependentePage = lazy(() => import('./pages/legado-app/dependentes/editar'))
const NovaRecordacaoPage = lazy(() => import('./pages/legado-app/recordacoes/novo'))
const RecordacoesListPage = lazy(() => import('./pages/legado-app/recordacoes/list'))
const NovoDependentePage = lazy(() => import('./pages/legado-app/dependentes/novo'))
const AcolhimentoPage = lazy(() => import('./pages/legado-app/parcerias/acalme-coracao'))
const DiarioListPage = lazy(() => import('./pages/legado-app/diario/DiarioListPage'))
const DiarioFormPage = lazy(() => import('./pages/legado-app/diario/DiarioFormPage'))
const ExercicioDetailPage = lazy(() => import('./pages/legado-app/exercicios/ExercicioDetailPage'))
const ExerciciosListPage = lazy(() => import('./pages/legado-app/exercicios/ExerciciosListPage'))
const ExerciciosHistoricoPage = lazy(() => import('./pages/legado-app/exercicios/ExerciciosHistoricoPage'))
const SelecaoModulosPage = lazy(() => import('./pages/legado-app/selecao-modulos/page'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const ParceirosPage = lazy(() => import('./admin/parceiro/ParceirosPage'))
const TitularesPage = lazy(() => import('./admin/titulares/TitularesPage'))
const BloqueadoPage = lazy(() => import('./BloqueadoPage'))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'))
const ConfiguracoesPage = lazy(() => import('./admin/configuracoes/page'))
const AdminParceiroDashboard = lazy(() => import('./admin-parceiro/dashboard'))
const ParceiroLayout = lazy(() => import('./admin-parceiro/ParceiroLayout'))
const MelhorIdadeLayout = lazy(() => import('./modules/melhor-idade/components/MelhorIdadeLayout'))
const MiHomePage = lazy(() => import('./modules/melhor-idade/pages/HomePage'))
const SaudePage = lazy(() => import('./modules/melhor-idade/pages/SaudePage'))
const CuidadoPage = lazy(() => import('./modules/melhor-idade/pages/CuidadoPage'))
const ReceitasPage = lazy(() => import('./modules/melhor-idade/pages/ReceitasPage'))
const MiFamiliaPage = lazy(() => import('./modules/melhor-idade/pages/FamiliaPage'))

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recordacoes-publicas/:id" element={<RecordacaoPublica />} />
          <Route path="/recordacoes-publicas/sucesso/:id" element={<Sucesso />} />
          <Route path="/consulta-recordacao" element={<ConsultaRecordacao />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/legado-app/login" element={<Login />} />
          <Route path="/legado-app/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/legado-app/titulares/novo" element={<CadastroTitular />} />
          <Route path="/bloqueado" element={<BloqueadoPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/legado-app/selecao-modulos" element={<SelecaoModulosPage />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/parceiros" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="parceiros" element={<ParceirosPage />} />
              <Route path="titulares" element={<TitularesPage />} />
              <Route path="configuracoes" element={<ConfiguracoesPage />} />
            </Route>

            <Route path="/admin-parceiro" element={<ParceiroLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminParceiroDashboard />} />
            </Route>

            <Route path="/legado-app/menu" element={<MenuPage />} />
            <Route path="/legado-app/titulares/editar/:id" element={<EditarTitularPage />} />
            <Route path="/legado-app/dependentes/editar/:id" element={<EditarDependentePage />} />
            <Route path="/legado-app/dependentes/novo" element={<NovoDependentePage />} />
            <Route path="/legado-app/recordacoes/list/:id" element={<RecordacoesListPage />} />
            <Route path="/legado-app/recordacoes/nova/:id" element={<NovaRecordacaoPage />} />
            <Route path="/legado-app/parcerias/acalme-coracao" element={<AcolhimentoPage />} />
            <Route path="/legado-app/diario" element={<DiarioListPage />} />
            <Route path="/legado-app/diario/novo" element={<DiarioFormPage />} />
            <Route path="/legado-app/diario/editar/:id" element={<DiarioFormPage />} />
            <Route path="/legado-app/exercicios/:id" element={<ExercicioDetailPage />} />
            <Route path="/legado-app/exercicios" element={<ExerciciosListPage />} />
            <Route path="/legado-app/exercicios/historico" element={<ExerciciosHistoricoPage />} />

            <Route path="/melhor-idade" element={<MelhorIdadeLayout />}>
              <Route index element={<MiHomePage />} />
              <Route path="minha-rotina" element={<CuidadoPage />} />
              <Route path="meu-cuidado" element={<ReceitasPage />} />
              <Route
                path="historias"
                element={
                  <DiarioListPage
                    embedded
                    basePath="/melhor-idade/historias"
                    pageTitle="Histórias e memórias"
                    pageSubtitle="Registre fotos, textos e momentos do seu dia em um espaço só seu."
                  />
                }
              />
              <Route
                path="historias/novo"
                element={<DiarioFormPage embedded basePath="/melhor-idade/historias" />}
              />
              <Route
                path="historias/editar/:id"
                element={<DiarioFormPage embedded basePath="/melhor-idade/historias" />}
              />
              <Route path="familia" element={<MiFamiliaPage />} />
              <Route path="familia/nova/:id" element={<NovaRecordacaoPage embedded />} />
              <Route
                path="familia/:id"
                element={
                  <RecordacoesListPage
                    embedded
                    backPath="/melhor-idade/familia"
                    novaBasePath="/melhor-idade/familia/nova"
                    apoioPath="/melhor-idade/apoio-orientacao"
                  />
                }
              />
              <Route
                path="apoio-orientacao"
                element={
                  <AcolhimentoPage
                    embedded
                    pageTitle="Conteúdo de apoio e orientação"
                    pageSubtitle={
                      <>
                        <strong className="text-[#007080]">Você não está sozinho</strong>
                        <span className="block text-sm text-[#4f665a]">
                          Vídeos e orientações para cuidar de si com carinho.
                        </span>
                      </>
                    }
                  />
                }
              />
              <Route path="meu-dia" element={<Navigate to="/melhor-idade/minha-rotina" replace />} />
              <Route path="mensagens" element={<Navigate to="/melhor-idade/familia" replace />} />
              <Route path="momentos" element={<Navigate to="/melhor-idade/historias" replace />} />
              <Route path="apoio" element={<Navigate to="/melhor-idade/apoio-orientacao" replace />} />
              <Route path="agenda" element={<Navigate to="/melhor-idade/minha-rotina" replace />} />
              <Route path="receitas" element={<Navigate to="/melhor-idade/meu-cuidado" replace />} />
              <Route path="saude" element={<SaudePage />} />
              <Route path="onboarding" element={<Navigate to="/melhor-idade" replace />} />
              <Route path="diario" element={<Navigate to="/melhor-idade/historias" replace />} />
              <Route path="equipe" element={<Navigate to="/melhor-idade/apoio-orientacao" replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      <Toaster />
    </BrowserRouter>
  )
}

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// PROVIDER DO TEMA (cores dinâmicas)
import { ThemeProvider } from "./components/ThemeProvider"

// PÁGINAS PÚBLICAS
import RecordacaoPublica from './pages/recordacoes-publicas/[id]'
import Sucesso from './pages/recordacoes-publicas/sucesso'
import Home from './pages/recordacoes-publicas/Home'
import ConsultaRecordacao from './pages/consulta-recordacao'
import Privacidade from './pages/privacidade'

// LEGADO APP
import Login from './pages/legado-app/login'
import MenuPage from './pages/legado-app/menu/page'
import CadastroTitular from './pages/legado-app/titulares/novo'
import EditarTitularPage from "./pages/legado-app/titulares/editar"
import EditarDependentePage from './pages/legado-app/dependentes/editar'
import NovaRecordacaoPage from './pages/legado-app/recordacoes/novo'
import RecordacoesListPage from './pages/legado-app/recordacoes/list'
import NovoDependentePage from './pages/legado-app/dependentes/novo'
import AcolhimentoPage from './pages/legado-app/parcerias/acalme-coracao'
import DiarioListPage from './pages/legado-app/diario/DiarioListPage'
import DiarioFormPage from './pages/legado-app/diario/DiarioFormPage'
import ExercicioDetailPage from './pages/legado-app/exercicios/ExercicioDetailPage'
import ExerciciosListPage from './pages/legado-app/exercicios/ExerciciosListPage'
import ExerciciosHistoricoPage from './pages/legado-app/exercicios/ExerciciosHistoricoPage'
import { Toaster } from "@/components/ui/toaster";

// NOVAS PÁGINAS
import SelecaoModulosPage from './pages/legado-app/selecao-modulos/page'
import AdminLayout from './admin/AdminLayout'
import ParceiroDashboard from './admin/parceiro/dashboard'
import PrivateRoute from './components/PrivateRoute'
import ParceirosPage from './admin/parceiro/ParceirosPage'
import TitularesPage from './admin/titulares/TitularesPage'
import BloqueadoPage from './BloqueadoPage'
import AdminDashboard from './admin/AdminDashboard'
import ConfiguracoesPage from './admin/configuracoes/page'

export default function App() {
  return (
    <BrowserRouter>

      {/* ====================================== */}
      {/*      PROVIDER DO SISTEMA DE CORES      */}
      {/* ====================================== */}
      <ThemeProvider />

      <Routes>
        {/* ========== PÁGINAS PÚBLICAS ========== */}
        <Route path="/" element={<Home />} />
        <Route path="/recordacoes-publicas/:id" element={<RecordacaoPublica />} />
        <Route path="/recordacoes-publicas/sucesso/:id" element={<Sucesso />} />
        <Route path="/consulta-recordacao" element={<ConsultaRecordacao />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/legado-app/login" element={<Login />} />
        <Route path="/legado-app/titulares/novo" element={<CadastroTitular />} />

        {/* ========== PAGINA DE SISTEMA BLOQUEADO ========== */}
        <Route path="/bloqueado" element={<BloqueadoPage />} />

        {/* ========== ROTAS PROTEGIDAS ========== */}
        <Route element={<PrivateRoute />}>

          {/* Seleção de Módulos (Home do Cliente) */}
          <Route path="/legado-app/selecao-modulos" element={<SelecaoModulosPage />} />

          {/* PAINÉL ADMIN */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/parceiros" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="parceiros" element={<ParceirosPage />} />
            <Route path="titulares" element={<TitularesPage />} />
            <Route path="configuracoes" element={<ConfiguracoesPage />} />
          </Route>

          {/* Painel do Parceiro */}
          <Route path="/parceiro" element={<ParceiroDashboard />} />

          {/* Rotas do Legado */}
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
        </Route>
      </Routes>

      <Toaster />
    </BrowserRouter>
  )
}
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Rotas públicas
import RecordacaoPublica from './pages/recordacoes-publicas/[id]'
import Sucesso from './pages/recordacoes-publicas/sucesso'
import Home from './pages/recordacoes-publicas/Home'
import ConsultaRecordacao from './pages/consulta-recordacao'
import Privacidade from './pages/privacidade'

// LEGADO APP
import Login from './pages/legado-app/login'
import CadastroTitular from './pages/legado-app/titulares/novo'
import MenuPage from './pages/legado-app/menu/page'
// import CadastroDependente from './pages/legado-app/dependentes/novo'
// (em breve: listagem de dependentes)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/recordacoes-publicas/:id" element={<RecordacaoPublica />} />
        <Route path="/recordacoes-publicas/sucesso/:id" element={<Sucesso />} />
        <Route path="/consulta-recordacao" element={<ConsultaRecordacao />} />
        <Route path="/privacidade" element={<Privacidade />} />

        {/* Legado App */}
        <Route path="/legado-app/login" element={<Login />} />
        <Route path="/legado-app/menu" element={<MenuPage />} />
        <Route path="/legado-app/titulares/novo" element={<CadastroTitular />} />
        {/* <Route path="/legado-app/dependentes/novo" element={<CadastroDependente />} /> */}
        {/* Ex: <Route path="/legado-app/dependentes" element={<ListaDependentes />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

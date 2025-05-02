import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RecordacaoPublica from './pages/recordacoes-publicas/[id]';
import Sucesso from './pages/recordacoes-publicas/sucesso';
import Home from './pages/recordacoes-publicas/Home';
import ConsultaRecordacao from './pages/consulta-recordacao';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recordacoes-publicas/:id" element={<RecordacaoPublica />} />
        <Route path="/recordacoes-publicas/sucesso/:id" element={<Sucesso />} />
        <Route path="/consulta-recordacao" element={<ConsultaRecordacao />} />
      </Routes>
    </BrowserRouter>
  );
}

import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RecordacaoPublica from './pages/recordacoes-publicas/[id]';
import Sucesso from './pages/recordacoes-publicas/sucesso';
import Home from './pages/recordacoes-publicas/Home';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recordacoes-publicas/:id" element={<RecordacaoPublica />} />
        <Route path="/recordacoes-publicas/sucesso" element={<Sucesso />} />
      </Routes>
    </BrowserRouter>
  );
}

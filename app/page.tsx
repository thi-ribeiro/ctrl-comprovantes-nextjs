"use client";

import React from "react";
import ListaComprovantes from "./Componentes/ListaComprovantes/ListaComprovantes";
import BarraMesAno from "./Componentes/BarraMesAno/BarraMesAno";

import TotalFlutuante from "./Componentes/TotalFlutuante/TotalFlutuante";
import { useComprovantes } from "./Contexto/ComprovanteContext";
import AdicionarComprovante from "./Componentes/AdicionarComprovante/AdicionarComprovante";

export default function Home() {
  const { dadosAgrupados } = useComprovantes();

  return (
    <React.Fragment>
      <BarraMesAno />

      <ListaComprovantes comprovantes={dadosAgrupados} />

      <div className="container-flutuante">
        <AdicionarComprovante loadingEnd={true} />
        <TotalFlutuante comprovantes={dadosAgrupados} />
      </div>
    </React.Fragment>
  );
}

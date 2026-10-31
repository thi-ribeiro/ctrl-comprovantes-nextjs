"use client";

import React from "react";
import ListaComprovantes from "./Componentes/ListaComprovantes/ListaComprovantes";
import BarraMesAno from "./Componentes/BarraMesAno/BarraMesAno";

import TotalFlutuante from "./Componentes/TotalFlutuante/TotalFlutuante";
import { useComprovantes } from "./Contexto/ComprovanteContext";
import AdicionarComprovante from "./Componentes/AdicionarComprovante/AdicionarComprovante";
import { MesSelecionadoFlutuante } from "./Componentes/MesSelecionadoFlutuante/MesSelecionadoFlutuante";

export default function Home() {
  const { dadosAgrupados } = useComprovantes();

  return (
    <React.Fragment>
      <BarraMesAno />

      <MesSelecionadoFlutuante />

      <ListaComprovantes comprovantes={dadosAgrupados} />

      <div className="container-flutuante">
        <AdicionarComprovante loadingEnd={true} />
        <TotalFlutuante comprovantes={dadosAgrupados} />
      </div>
    </React.Fragment>
  );
}

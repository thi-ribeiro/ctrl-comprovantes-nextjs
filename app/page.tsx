"use client";

import React, { useEffect, useState } from "react";
import ListaComprovantes from "./Componentes/ListaComprovantes/ListaComprovantes";
import BarraMesAno from "./Componentes/BarraMesAno/BarraMesAno";

import TotalFlutuante from "./Componentes/TotalFlutuante/TotalFlutuante";
import { useComprovantes } from "./Contexto/ComprovanteContext";
import AdicionarComprovante from "./Componentes/AdicionarComprovante/AdicionarComprovante";

export default function Home() {
  const [selectChanged, setSelectChanged] = useState({
    ano: "",
    mes: "",
  });

  const { fetchDataComprovantes, dadosAgrupados } = useComprovantes();

  useEffect(() => {
    if (!selectChanged.ano || !selectChanged.mes) return;

    fetchDataComprovantes(selectChanged.ano, selectChanged.mes);
  }, [selectChanged]);

  return (
    <React.Fragment>
      <BarraMesAno
        comprovantes={dadosAgrupados}
        onSelectChange={(ano, mes) => setSelectChanged({ ano, mes })}
      />

      <>
        <ListaComprovantes comprovantes={dadosAgrupados} />

        <div className="container-flutuante">
          <AdicionarComprovante loadingEnd={true} />
          <TotalFlutuante comprovantes={dadosAgrupados} />
        </div>
      </>
    </React.Fragment>
  );
}

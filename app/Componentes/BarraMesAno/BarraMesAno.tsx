import React, { useEffect, useState } from "react";
import { useComprovantes } from "@/app/Contexto/ComprovanteContext";
import { LuSearch } from "react-icons/lu";

const BarraMesAno = () => {
  const {
    mesAno,
    fetchDataMesesAnos,
    fetchDataComprovantes,
    selecionarAnoMes,
    anoMesSelecionado,
  } = useComprovantes();

  const [anoEscolha, setAnoEscolha] = useState<string>("");

  useEffect(() => {
    fetchDataMesesAnos();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mesesDoAnoAtual =
    anoEscolha && mesAno && mesAno[anoEscolha] ? mesAno[anoEscolha] : [];

  // Mês ativo derivado (contexto ou o último do ano atual como fallback)
  const mesAtivo =
    anoMesSelecionado.mes ||
    (mesesDoAnoAtual.length > 0
      ? mesesDoAnoAtual[mesesDoAnoAtual.length - 1].num.toString()
      : "");

  const handleAnoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAnoEscolha(event.target.value);
  };

  const handleMesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    selecionarAnoMes(anoMesSelecionado.ano, event.target.value);
    //VERIFICAR DEPOIIS!
  };

  const handleBuscarClick = () => {
    if (!anoEscolha || !mesAtivo) return;
    fetchDataComprovantes(anoEscolha, mesAtivo);
    selecionarAnoMes(anoEscolha, mesAtivo ?? anoMesSelecionado.mes);
  };

  if (!mesAno)
    return (
      <div className="generico-centralizado">
        <p>Carregando listagem de anos / meses ...</p>
      </div>
    );

  return (
    <div className="listagem-mes-ano-header">
      <div className="listagem-mes-ano-item">
        <select
          className="listagem-mes-ano-select listagem-ano-fix"
          id="ano"
          value={anoEscolha}
          onChange={handleAnoChange}
        >
          <option value="" disabled>
            Selecione o ano:
          </option>
          {Object.entries(mesAno).map(([ano]) => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>

        {/* Repassa apenas o array de meses correspondente ao ano escolhido */}
        {anoEscolha && mesAno[anoEscolha] && (
          // <SeletorMes
          //   key={anoEscolha}
          //   mesesDoAno={mesAno[anoEscolha]}
          //   onBuscar={handleBuscarClick}
          // />
          <>
            <div className="listagem-mes-ano-item">
              <select
                className="listagem-mes-ano-select"
                id="mes"
                value={mesAtivo}
                onChange={handleMesChange}
              >
                {mesAno[anoEscolha].map((mes) => (
                  <option key={mes.num} value={mes.num}>
                    {mes.nome}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" onClick={() => handleBuscarClick()}>
              <LuSearch size={20} className="text-gray-700" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BarraMesAno;

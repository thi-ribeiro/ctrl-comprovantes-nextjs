import React, { useEffect, useState } from "react";

interface Props {
  onSelectChange: (ano: string, mes: string) => void;
}

import { Comprovante2 } from "../../types";
import { useComprovantes } from "@/app/Contexto/ComprovanteContext";

interface Props {
  comprovantes: Record<string, Comprovante2[]>;
  onSelectChange: (ano: string, mes: string) => void;
}

const dataAtual = new Date();

const BarraMesAno = ({ onSelectChange }: Props) => {
  const { fetchDataMesesAnos, mesAno } = useComprovantes();

  const anoHoje = new Date().getFullYear().toString();
  const mesHoje = new Date().getMonth() + 1;

  const [anoSelecionado, setAnoSelecionado] = useState<string>(
    dataAtual.getFullYear().toString(),
  );

  const [mesSelecionado, setMesSelecionado] = useState<string | number>(() => {
    const mesesDoAno = mesAno?.[anoHoje];
    const mesAtualStr = mesHoje.toString().padStart(2, "0");

    if (mesesDoAno && mesesDoAno.length > 0) {
      // Procura se o mês atual existe no array (comparando como string ou número)
      const mesAtualExiste = mesesDoAno.some(
        (m: { num: string | number }) =>
          m.num.toString() === mesAtualStr || m.num === mesHoje,
      );

      // Se existir, usa o mês atual; se não, pega o último do array
      if (mesAtualExiste) {
        return mesAtualStr;
      }

      return mesesDoAno[mesesDoAno.length - 1].num.toString();
    }

    // Fallback caso mesAno seja null ou esteja vazio
    return mesAtualStr;
  });

  useEffect(() => {
    fetchDataMesesAnos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mesAno) return;

    const anosDisponiveis = Object.keys(mesAno);
    if (anosDisponiveis.length === 0) return;

    // 1. Tenta pegar a lista do ano atual direto
    const listaMesesDoAno = mesAno[anoHoje];

    // Se o ano atual existe no objeto
    if (listaMesesDoAno) {
      // Procura o mês atual dentro da lista
      const temMesAtual = listaMesesDoAno.some(
        (m: { num: string | number }) => m.num === mesHoje,
      );
      const ultimoMesDisponivel =
        listaMesesDoAno[listaMesesDoAno.length - 1].num.toString();

      const mesFinal = temMesAtual ? mesHoje.toString() : ultimoMesDisponivel;

      onSelectChange(anoHoje, mesFinal);

      return; // Encerra aqui se resolveu o ano atual
    }

    // 2. Se NÃO existe o ano atual, pega direto o primeiro ano e primeiro mês disponíveis
    const primeiroAno = anosDisponiveis[0];
    const primeiroMes = mesAno[primeiroAno][0]?.num.toString();

    if (primeiroAno && primeiroMes) {
      onSelectChange(primeiroAno, mesHoje.toString());
    }
  }, [mesAno]);
  //Não posso colocar o fetchdatameses aqui porque toda vez que mudar o mesAno vai atualizar e resetar o select, então só quero que ele rode uma vez no inicio, por isso o array de dependencias vazio

  const handleAnoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const novoAno = event.target.value;

    // 1. Pega os meses do novo ano
    const mesesDoNovoAno = mesAno?.[novoAno];

    // 2. Pega o ÚLTIMO mês disponível (se o array existir e tiver itens)
    const ultimoMesObjeto = mesesDoNovoAno?.[mesesDoNovoAno.length - 1];
    const ultimoMes = ultimoMesObjeto?.num.toString() || "";

    // 3. Atualiza os estados locais com o último mês
    setAnoSelecionado(novoAno);
    setMesSelecionado(ultimoMes);

    // 4. Avisa o pai com o ano novo e o último mês
    onSelectChange(novoAno, ultimoMes);
  };

  const handleMesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const novoMes = event.target.value;
    setMesSelecionado(novoMes);
    onSelectChange(anoSelecionado, novoMes);
  };

  if (!mesAno)
    return (
      <div className="generico-centralizado">
        <p>Carregando listagem de meses ...</p>
      </div>
    );

  return (
    <div className="listagem-mes-ano-header">
      <div className="listagem-mes-ano-item">
        <label htmlFor="ano">Ano: </label>
        <select
          className="listagem-mes-ano-select"
          id="ano"
          value={anoSelecionado}
          onChange={handleAnoChange}
        >
          {Object.entries(mesAno).map(([ano]) => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>
        {anoSelecionado && mesAno[anoSelecionado] && (
          <div className="listagem-mes-ano-item">
            <label htmlFor="mes">Mês:</label>
            <select
              className="listagem-mes-ano-select"
              id="mes"
              value={mesSelecionado}
              onChange={handleMesChange}
            >
              {mesAno[anoSelecionado].map(
                (mes: { num: string | number; nome: string }) => (
                  <option key={mes.num} value={mes.num}>
                    {mes.nome}
                  </option>
                ),
              )}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarraMesAno;

"use client";

import { useComprovantes } from "@/app/Contexto/ComprovanteContext";
import React from "react";
import { LuSearch } from "react-icons/lu";

interface Mes {
  num: string | number;
  nome: string;
}

interface SeletorMesProps {
  mesesDoAno: Mes[];
  onBuscar: (mesSelecionado: string) => void;
}

const SeletorMes = ({ mesesDoAno, onBuscar }: SeletorMesProps) => {
  // Puxamos também a função que altera o mês lá do contexto
  const { mesSelecionado, selecionarMes } = useComprovantes();

  // Define o mês ativo: ou o do contexto, ou o último da lista como fallback
  const mesAtivo =
    mesSelecionado ||
    (mesesDoAno.length > 0
      ? mesesDoAno[mesesDoAno.length - 1].num.toString()
      : "");

  const handleMesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // Atualiza direto no Contexto! Assim a aplicação inteira fica sabendo.
    selecionarMes(event.target.value);
  };

  return (
    <>
      <div className="listagem-mes-ano-item">
        <select
          className="listagem-mes-ano-select"
          id="mes"
          value={mesAtivo}
          onChange={handleMesChange}
        >
          {mesesDoAno.map((mes) => (
            <option key={mes.num} value={mes.num}>
              {mes.nome}
            </option>
          ))}
        </select>
      </div>
      {/* O botão agora busca usando o mesAtivo unificado */}
      <button type="button" onClick={() => onBuscar(mesAtivo)}>
        <LuSearch size={20} className="text-gray-700" />
      </button>
    </>
  );
};

export default SeletorMes;
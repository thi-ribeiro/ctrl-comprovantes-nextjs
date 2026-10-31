import { Comprovante2 } from "../../types";
import { useComprovantes } from "@/app/Contexto/ComprovanteContext";
import EditarComprovante from "../EditarComprovante/EditarComprovante";
import React, { useState } from "react";
import { LuArrowLeftRight, LuMinus } from "react-icons/lu";

interface Props {
  comprovantes: Record<string, Comprovante2[]>;
}

const ListaComprovantes = ({ comprovantes }: Props) => {
  const {
    loadingComprovantes,
    apagarComprovante,
    mesAno,
    nomeDoMes,
    mesSelecionado,
  } = useComprovantes();

  const [dadosComprovante, setDadosComprovante] = useState<Comprovante2 | null>(
    null,
  );

  const grupos = Object.entries(comprovantes || {}).sort(
    ([diaA], [diaB]) => Number(diaA) - Number(diaB),
  );

  if (loadingComprovantes) {
    return (
      <div className="generico-centralizado">
        <p>Carregando comprovantes...</p>
      </div>
    );
  }


  if (!grupos.length || !mesAno) {
    return (
      <div className="generico-centralizado">
        Selecione o ano e o mês para exibir os comprovantes.
      </div>
    );
  } else if (!grupos.length) {
    return (
      <div className="generico-centralizado">
        Nenhum comprovante encontrado para o mês de {nomeDoMes(mesSelecionado)}.
      </div>
    );
  }

  const checkBancoComprovante = (item: Comprovante2) => {
    if (item.cartaoComprovante === "Caixa") {
      return "comprovante-caixa";
    }
    if (item.cartaoComprovante === "Banestes") {
      return "comprovante-banestes";
    }
    if (item.cartaoComprovante === "Bradesco") {
      return "comprovante-bradesco";
    }
    return "";
  };

  const valorTotalDoDia = (itens: Comprovante2[]) => {
    return itens.reduce((total, item) => total + item.valorComprovante, 0);
  };

  return (
    <div className="comprovante-lista">
      {grupos.map(([data, itens]) => (
        <div key={data} className="grupo-comprovantes">
          <div className="data-header">{data}</div>

          <div className="lista-itens">
            {itens.map((item) => (
              <div
                key={item.idComprovante}
                className={`comprovante-item ${checkBancoComprovante(item)}`}
              >
                <span>{item.usuarioComprovante}</span>
                <span>{item.motivoComprovante}</span>
                <span>
                  {Number(item.valorComprovante).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>

                <div className="acoes-comprovante">
                  <button
                    className="editar"
                    onClick={() =>
                      setDadosComprovante({
                        ...item,
                      })
                    }
                  >
                    <LuArrowLeftRight className="change" size={18} />
                  </button>

                  <button
                    onClick={() =>
                      apagarComprovante(
                        item.idComprovante,
                        item.data,
                        item.nomeArquivo,
                      )
                    }
                  >
                    <LuMinus className="remove" size={18} />
                  </button>
                </div>
              </div>
            ))}
            <div className="total-dia">
              Total do dia:{" "}
              {valorTotalDoDia(itens).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          </div>
        </div>
      ))}

      <EditarComprovante
        itemSelecionado={dadosComprovante}
        onClose={() => setDadosComprovante(null)}
      />
    </div>
  );
};
export default ListaComprovantes;

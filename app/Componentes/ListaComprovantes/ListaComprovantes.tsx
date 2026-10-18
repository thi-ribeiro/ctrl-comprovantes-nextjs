import { Comprovante2 } from "../../types";
import { useComprovantes } from "@/app/Contexto/ComprovanteContext";

import { CgArrowsExchange, CgMathMinus } from "react-icons/cg";
import EditarComprovante from "../EditarComprovante/EditarComprovante";
import React, { useState } from "react";

interface Props {
  comprovantes: Record<string, Comprovante2[]>;
}

const ListaComprovantes = ({ comprovantes }: Props) => {
  const { loadingComprovantes, apagarComprovante } = useComprovantes();

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

  if (grupos.length === 0) {
    return (
      <div className="generico-centralizado">
        Nenhum comprovante encontrado para o mês selecionado.
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
                    <CgArrowsExchange className="change" size={20} />
                  </button>

                  <button
                    onClick={() =>
                      apagarComprovante(item.idComprovante, item.data)
                    }
                  >
                    <CgMathMinus className="remove" size={20} />
                  </button>
                </div>
              </div>
            ))}
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

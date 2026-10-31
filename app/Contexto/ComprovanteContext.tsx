"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { Comprovante2, EstruturaMesAno } from "../types";
import _ from "lodash";

interface ComprovantesContextType {
  loadingComprovantes: boolean;
  loadingMesesAnos: boolean;
  dadosAgrupados: Record<string, Comprovante2[]>; // Aqui você pode definir o tipo correto para os dados agrupados
  fetchDataComprovantes: (ano?: string, mes?: string) => Promise<void>;
  fetchDataMesesAnos: () => Promise<void>;
  mesAno: EstruturaMesAno | null; // Aqui você pode definir o tipo correto para a estrutura de meses e anos
  totalDatas: number; // Aqui você pode definir o tipo correto para o total
  formatarMoeda: (valor: number) => string; // Função para formatar valores monetários
  apagarComprovante: (
    id: number,
    data: string,
    nomeArquivo: string,
  ) => Promise<void>; // Função para apagar um comprovante
  separaMesAno: (data: string) => { ano: string; mes: string }; // Função para separar ano e mês de uma data
  mesAnoAtual: () => { ano: string; mes: string }; // Função para obter o mês e ano atual
  mesSelecionado: string;
  selecionarMes: (novoMes: string) => void;
  nomeDoMes: (mes: string) => string;
}

const ComprovantesContext = createContext<ComprovantesContextType | undefined>(
  undefined,
);

interface ComprovantesProviderProps {
  children: ReactNode; // 'children' é uma propriedade padrão para componentes que envolvem outros
}

export function ComprovantesProvider({ children }: ComprovantesProviderProps) {
  const [dadosBrutos, setdadosBrutos] = useState([]);
  const [loadingComprovantes, setloadingComprovantes] = useState(false);
  const [loadingMesesAnos, setloadingMesesAnos] = useState(false);
  const [mesAno, setmesAno] = useState<EstruturaMesAno | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState<string>("");

  const nomeDoMes = (mes: string) => {
    const data = new Date(2000, Number(mes) - 1, 15);
    const nome = data.toLocaleDateString("pt-BR", { month: "long" });
    return nome.charAt(0).toUpperCase() + nome.slice(1);
  };

  const separaMesAno = (data: string) => {
    const [ano, mes] = data.split("T")[0].split("-");
    return { ano, mes };
  };

  const mesAnoAtual = () => {
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear().toString();
    const mesAtual = (dataAtual.getMonth() + 1).toString().padStart(2, "0");
    return { ano: anoAtual, mes: mesAtual };
  };

  const { ano: anoAtual, mes: mesAtual } = mesAnoAtual();

  const fetchDataComprovantes = async (
    ano: string | number = anoAtual,
    mes: string | number = mesAtual,
  ) => {
    setloadingComprovantes(true);

    console.log("Fetch do contexto:");

    try {
      const response = await fetch(
        `/Routes/Comprovantes?acao=dados&ano=${ano}&mes=${mes}`,
      );
      const data = await response.json();
      setdadosBrutos(data.dados);

      //console.log("Dados recebidos:", data.dados);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setloadingComprovantes(false);
    }
  };

  const fetchDataMesesAnos = async () => {
    try {
      setloadingMesesAnos(true);
      const response = await fetch("/Routes/Comprovantes?acao=listarAnos");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setmesAno(data.estrutura);
      //console.log("Dados recebidos:", data.estrutura);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setloadingMesesAnos(false);
    }
  };

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const dadosAgrupados = useMemo(() => {
    return _.groupBy(dadosBrutos, "dataFormatada");
  }, [dadosBrutos]);

  const totalDatas = useMemo(() => {
    const todosOsComprovantes = _.flatMap(dadosAgrupados);

    const total = _.sumBy(
      todosOsComprovantes,
      // (item: Comprovante2) => parseFloat(item.valorComprovante) || 0,
      (item: Comprovante2) => item.valorComprovante || 0,
    );
    //return formatarMoeda(total);
    return total;
  }, [dadosAgrupados]);

  const apagarComprovante = async (
    id: number,
    dataT: string,
    nomeArquivo: string,
  ) => {
    // Pede confirmação antes de fazer qualquer coisa
    const confirmado = window.confirm(
      "Tem certeza de que quer apagar este comprovante?",
    );

    if (!confirmado) return;

    try {
      const [anoSpl, mesSpl] = dataT.split("-");

      const caminhoArquivo = `uploads/${anoSpl}/${mesSpl}/${nomeArquivo}`;

      const resLocal = await fetch("http://192.168.1.14:666/deletar-arquivo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ caminhoArquivo }),
      });

      if (!resLocal.ok) {
        console.warn(
          "Aviso: O arquivo local não foi encontrado ou já havia sido apagado.",
        );
      } else {
        console.log("Arquivo físico local apagado com sucesso!");
      }

      const response = await fetch(
        `/Routes/Comprovantes/DeletarComprovante?id=${id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao apagar no banco de dados.");
      }

      console.log(data.message);

      // 1. Dispara a atualização do contexto em segundo plano
      await fetchDataMesesAnos();

      const { ano, mes } = separaMesAno(dataT);

      // 2. Pega a lista atual e JÁ FILTRA removendo o mês que você acabou de apagar
      const mesesAtualizados = (mesAno?.[ano] || []).filter(
        (m) => m.num.toString() !== mes.toString(),
      );

      // 3. Pega o novo último mês disponível (que agora será o 9, já que o 10 foi filtrado)
      const ultimoMesDisponivel =
        mesesAtualizados.length > 0
          ? mesesAtualizados[mesesAtualizados.length - 1].num
          : null;

      if (ultimoMesDisponivel) {
        selecionarMes(ultimoMesDisponivel.toString());
        await fetchDataComprovantes(ano, ultimoMesDisponivel);
      } else {
        console.log("O ano ficou sem meses cadastrados.");
      }
    } catch (error) {
      console.error("Erro ao apagar:", error);
      alert((error as Error).message || "Falha ao processar a exclusão.");
    }
  };

  const selecionarMes = (novoMes: string) => {
    setMesSelecionado(novoMes);
    // Se quiser colocar algo extra aqui no futuro (ex: log, validação, fetch), já fica centralizado
  };

  const valoresContext: ComprovantesContextType = {
    loadingComprovantes, // Inicialmente, não está carregando
    loadingMesesAnos,
    dadosAgrupados,
    totalDatas,
    formatarMoeda,
    fetchDataComprovantes,
    fetchDataMesesAnos,
    apagarComprovante,
    separaMesAno,
    mesAno,
    mesAnoAtual,
    mesSelecionado,
    selecionarMes,
    nomeDoMes,
  };

  return (
    // O ComprovantesContext.Provider envolve os 'children' e passa o 'valoresContext' para eles
    <ComprovantesContext.Provider value={valoresContext}>
      {children}
    </ComprovantesContext.Provider>
  );
}

export const useComprovantes = () => {
  const context = useContext(ComprovantesContext);
  if (context === undefined) {
    throw new Error(
      "useComprovantes deve ser usado dentro de um ComprovantesProvider.",
    );
  }
  return context;
};

"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { Comprovante2, EstruturaMesAno } from "../types";
import _ from "lodash";

interface ComprovantesContextType {
  loadingComprovantes: boolean;
  loadingMesesAnos: boolean;
  dadosAgrupados: Record<string, Comprovante2[]>; // Aqui você pode definir o tipo correto para os dados agrupados
  fetchDataComprovantes: (ano?: string, mes?: string) => Promise<number | null>; // Função para buscar os comprovantes, retornando void ou null em caso de erro
  fetchDataMesesAnos: () => Promise<EstruturaMesAno | null>;
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
  anoMesSelecionado: { ano: string; mes: string };
  anoMesCarregado: { ano: string; mes: string };
  selecionarAnoMes: (novoAno: string, novoMes: string) => void;
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
  const [anoMesSelecionado, setanoMesSelecionado] = useState({
    ano: "",
    mes: "",
  });

  const [anoMesCarregado, setAnoMesCarregado] = useState({ ano: "", mes: "" });

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
    ano: string = anoAtual,
    mes: string = mesAtual,
  ): Promise<number | null> => {
    setloadingComprovantes(true);

    try {
      const response = await fetch(
        `/Routes/Comprovantes?acao=dados&ano=${ano}&mes=${mes}`,
      );
      if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);

      const data = await response.json();
      setdadosBrutos(data.dados);
      setAnoMesCarregado({ ano, mes });
      return data.dados.length;
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      return null; // null = deu erro, 0 = mês realmente vazio
    } finally {
      setloadingComprovantes(false);
    }
  };

  const fetchDataMesesAnos = async (): Promise<EstruturaMesAno | null> => {
    try {
      setloadingMesesAnos(true);
      const response = await fetch("/Routes/Comprovantes?acao=listarAnos");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setmesAno(data.estrutura);
      return data.estrutura;
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      return null;
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
    const confirmado = window.confirm(
      "Tem certeza de que quer apagar este comprovante?",
    );
    if (!confirmado) return;

    try {
      const { ano, mes } = separaMesAno(dataT);

      // 1. apaga no banco primeiro (se falhar, nada mais é apagado)
      const response = await fetch(
        `/Routes/Comprovantes/DeletarComprovante?id=${id}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.erro || "Erro ao apagar no banco de dados.");
      }

      // 2. depois apaga o arquivo local (falha aqui não é crítica)
      try {
        const caminhoArquivo = `uploads/${ano}/${mes}/${nomeArquivo}`;
        const resLocal = await fetch(
          "http://192.168.1.14:666/deletar-arquivo",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ caminhoArquivo }),
          },
        );
        if (!resLocal.ok) console.warn("Arquivo local não encontrado.");
      } catch (err) {
        console.warn("Servidor local indisponível:", err);
      }

      const mesesAtualizados = await fetchDataMesesAnos();
      const ultimoMes = _.last(mesesAtualizados?.[ano] ?? []);

      selecionarAnoMes(ano, ultimoMes?.num.toString() ?? mes);
      await fetchDataComprovantes(ano, ultimoMes?.num.toString() ?? mes);
    } catch (error) {
      console.error("Erro ao apagar:", error);
      alert((error as Error).message || "Falha ao processar a exclusão.");
    }
  };

  const selecionarAnoMes = (novoAno: string, novoMes: string) => {
    setanoMesSelecionado({ ano: novoAno, mes: novoMes });
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
    anoMesSelecionado,
    selecionarAnoMes,
    nomeDoMes,
    anoMesCarregado,
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

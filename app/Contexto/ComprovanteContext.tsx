"use client"; // Esta linha é crucial para que o Next.js saiba que é um Client Component

import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { Comprovante2, EstruturaMesAno } from "../types";
import _ from "lodash";

interface ComprovantesContextType {
  loadingComprovantes: boolean;
  loadingMesesAnos: boolean;
  dadosAgrupados: Record<string, Comprovante2[]>; // Aqui você pode definir o tipo correto para os dados agrupados
  fetchDataComprovantes: (ano: string, mes: string) => Promise<void>;
  fetchDataMesesAnos: () => Promise<void>;
  mesAno: EstruturaMesAno | null; // Aqui você pode definir o tipo correto para a estrutura de meses e anos
  totalDatas: number; // Aqui você pode definir o tipo correto para o total
  formatarMoeda: (valor: number) => string; // Função para formatar valores monetários
  apagarComprovante: (id: number, data: string) => Promise<void>; // Função para apagar um comprovante
  separaMesAno: (data: string) => { ano: string; mes: string }; // Função para separar ano e mês de uma data
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

  const separaMesAno = (data: string) => {
    const [ano, mes] = data.split("T")[0].split("-");
    return { ano, mes };
  };

  const fetchDataComprovantes = async (ano: string, mes: string) => {
    setloadingComprovantes(true);
    try {
      const response = await fetch(
        `/Routes/Comprovantes?acao=dados&ano=${ano}&mes=${mes}`,
      );
      const data = await response.json();
      setdadosBrutos(data.dados);
      //const groupedData = _.groupBy(data.dados, "dataFormatada");
      //setdadosComprovantes(groupedData);
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

  const apagarComprovante = async (id: number, dataT: string) => {
    // Pede confirmação antes de fazer qualquer coisa
    const confirmado = window.confirm(
      "Tens a certeza de que queres apagar este comprovante?",
    );

    if (!confirmado) return; // Se o utilizador cancelar, não faz nada

    const response = await fetch(
      `/Routes/Comprovantes/DeletarComprovante?id=${id}`,
      {
        method: "DELETE",
      },
    );

    const data = await response.json();
    if (response.ok) {
      console.log(data.message);
      const dataTrabalhar = separaMesAno(dataT);
      fetchDataComprovantes(dataTrabalhar.ano, dataTrabalhar.mes); // Atualiza a lista de comprovantes após a exclusão
    } else {
      console.error("Erro ao apagar:", data.erro);
    }
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

import React from "react";
import { Comprovante, Comprovante2 } from "../../types";
import { useComprovantes } from "@/app/Contexto/ComprovanteContext";

interface Props {
  comprovantes: Record<string, Comprovante2[]>;
}
export default function TotalFlutuante({ comprovantes }: Props) {
  const { totalDatas, formatarMoeda } = useComprovantes();

  return !totalDatas ? null : (
    <div className="total-flutuante">Total: {formatarMoeda(totalDatas)}</div>
  );
}

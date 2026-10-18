// src/types/index.ts

export interface Comprovante {
  id: number;
  data?: string;
  dataFormatada?: string;
  descricao: string;
  pagador: string;
  tipo: string;
  valor: string;
  forma: string;
  observacao: string;
  total: string;
}

export interface Comprovante2 {
  idComprovante: number;
  data: string;
  dataComprovante?: string;
  dataFormatada?: string;
  motivoComprovante: string;
  usuarioComprovante: string;
  linkComprovante: string;
  horarioPostComprovante: string;
  tipo: string;
  valorComprovante: number;
  cartaoComprovante: string;
  observacao: string;
  total: string;
}

export interface MesInfo {
  num: number;
  nome: string;
}

export interface EstruturaMesAno {
  [ano: string]: MesInfo[];
}

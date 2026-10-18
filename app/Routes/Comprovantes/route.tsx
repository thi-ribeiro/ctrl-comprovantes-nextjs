import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";
import _ from "lodash";

import { FieldPacket } from "mysql2"; // Importe o FieldPacket

interface RowData {
  ano: number;
  mes_num: number;
  mes_nome: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const acao = searchParams.get("acao"); // "listarAnos", "dados"

  try {
    await pool.execute("SET lc_time_names = 'pt_BR'");

    if (acao === "listarAnos") {
      const query = `
          SELECT DISTINCT 
          YEAR(data) as ano, 
          MONTH(data) as mes_num,
          DATE_FORMAT(data, '%M') as mes_nome
      FROM comprovantes 
      ORDER BY ano, mes_num
    `;

      const result = await pool.execute(query);
      const rows = (result as [RowData[], FieldPacket[]])[0];

      // Agrupa pelo ano e transforma a lista para manter apenas o mês
      const estrutura = _.mapValues(_.groupBy(rows, "ano"), (meses) =>
        meses.map((m) => ({ num: m.mes_num, nome: m.mes_nome })),
      );

      return NextResponse.json({ estrutura }, { status: 200 });
    }

    const mes = searchParams.get("mes");
    const ano = searchParams.get("ano");
    const [rows] = await pool.execute(
      "SELECT *, DATE_FORMAT(data, '%d') as dataFormatada FROM comprovantes WHERE MONTH(data) = ? AND YEAR(data) = ? ORDER BY data",
      [mes, ano],
    );

    return NextResponse.json({ dados: rows });
  } catch (error) {
    return NextResponse.json(
      { erro: (error as Error).message },
      { status: 500 },
    );
  }
}

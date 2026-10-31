import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    await pool.execute("SET lc_time_names = 'pt_BR'");

    const body = await request.json();
    const dados = body.data || body;

    console.log("DADOS CHEGANDO NA ROTA DO NEXT:", dados);

    const [columns] = await pool.execute("SHOW COLUMNS FROM comprovantes");
    console.log("COLUNAS REAIS QUE O BANCO VÊ:", columns);

    const {
      dataComprovante,
      usuarioComprovante,
      cartaoComprovante,
      motivoComprovante,
      valorComprovante,
      linkComprovante,
      nomeArquivo,
    } = dados;

    if (
      !dataComprovante ||
      !usuarioComprovante ||
      !cartaoComprovante ||
      !motivoComprovante ||
      !valorComprovante ||
      !linkComprovante
    ) {
      return NextResponse.json(
        { erro: "Todos os campos e o comprovante são obrigatórios." },
        { status: 400 },
      );
    }

    const [result] = await pool.execute(
      `INSERT INTO comprovantes (data, usuarioComprovante, cartaoComprovante, motivoComprovante, valorComprovante, linkComprovante, nomeArquivo) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        dataComprovante,
        usuarioComprovante,
        cartaoComprovante,
        motivoComprovante,
        valorComprovante,
        linkComprovante,
        nomeArquivo || null,
      ],
    );

    return NextResponse.json({
      message: "Comprovante adicionado com sucesso.",
      caminhoSalvo: linkComprovante,
      result,
    });
  } catch (error) {
    console.error("ERRO COMPLETO NA QUERY SQL:", error);
    return NextResponse.json(
      { erro: (error as Error).message },
      { status: 500 },
    );
  }
}

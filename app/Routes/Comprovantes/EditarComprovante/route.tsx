import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";
import { ResultSetHeader } from "mysql2";

const vazio = (v: unknown) => v === undefined || v === null || v === "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dados = body.data || body;

    const {
      idComprovante,
      dataComprovante,
      usuarioComprovante,
      cartaoComprovante,
      motivoComprovante,
      valorComprovante,
    } = dados;

    if (
      [
        idComprovante,
        dataComprovante,
        usuarioComprovante,
        cartaoComprovante,
        motivoComprovante,
        valorComprovante,
      ].some(vazio)
    ) {
      return NextResponse.json(
        { erro: "Preencha todos os campos obrigatórios." },
        { status: 400 },
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE comprovantes
       SET data = ?, usuarioComprovante = ?, cartaoComprovante = ?,
           motivoComprovante = ?, valorComprovante = ?
       WHERE idComprovante = ?`,
      [
        dataComprovante,
        usuarioComprovante,
        cartaoComprovante,
        motivoComprovante,
        valorComprovante,
        idComprovante,
      ],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { erro: "Comprovante não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Comprovante atualizado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao atualizar comprovante:", error);
    return NextResponse.json(
      { erro: "Erro interno ao atualizar o comprovante." },
      { status: 500 },
    );
  }
}

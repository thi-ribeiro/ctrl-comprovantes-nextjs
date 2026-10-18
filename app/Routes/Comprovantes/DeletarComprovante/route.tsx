import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";
import { UTApi } from "uploadthing/server";
import { RowDataPacket } from "mysql2";

const utapi = new UTApi();

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idComprovante = searchParams.get("id");

    if (!idComprovante) {
      return NextResponse.json(
        { erro: "ID do comprovante não fornecido." },
        { status: 400 },
      );
    }

    // 1. Busca o link do comprovante no banco antes de apagar, para localizar o arquivo na nuvem
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT linkComprovante FROM comprovantes WHERE idComprovante = ?",
      [idComprovante],
    );

    const linkComprovante = rows[0]?.linkComprovante;

    // 2. Se existir um arquivo na nuvem, remove-o do Uploadthing
    if (linkComprovante) {
      const fileKey = linkComprovante.split("/f/")[1];
      if (fileKey) {
        try {
          await utapi.deleteFiles(fileKey);
        } catch (err) {
          console.error("Erro ao remover o arquivo do Uploadthing:", err);
        }
      }
    }

    // 3. Apaga o registo da base de dados
    const [result] = await pool.execute(
      "DELETE FROM comprovantes WHERE idComprovante = ?",
      [idComprovante],
    );

    return NextResponse.json({
      message: "Comprovante excluído com sucesso.",
      result,
    });
  } catch (error) {
    return NextResponse.json(
      { erro: (error as Error).message },
      { status: 500 },
    );
  }
}

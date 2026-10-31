// import { NextResponse } from "next/server";
// import { pool } from "@/app/lib/db";
// import { UTApi } from "uploadthing/server";
// import { RowDataPacket } from "mysql2";

// const utapi = new UTApi();

// export async function POST(request: Request) {
//   try {
//     await pool.execute("SET lc_time_names = 'pt_BR'");

//     const body = await request.json();
//     const dados = body.data || body;

//     const {
//       idComprovante,
//       dataComprovante,
//       usuarioComprovante,
//       cartaoComprovante,
//       motivoComprovante,
//       valorComprovante,
//       linkComprovante, // URL vinda do Uploadthing
//     } = dados;

//     // 1. Validação geral dos campos obrigatórios
//     if (
//       !dataComprovante ||
//       !usuarioComprovante ||
//       !cartaoComprovante ||
//       !motivoComprovante ||
//       !valorComprovante
//     ) {
//       return NextResponse.json(
//         { erro: "Todos os campos do formulário são obrigatórios." },
//         { status: 400 },
//       );
//     }

//     // 2. Fluxo de ADICIONAR (Insert)
//     if (!idComprovante) {
//       if (!linkComprovante) {
//         return NextResponse.json(
//           { erro: "O comprovante (arquivo) é obrigatório." },
//           { status: 400 },
//         );
//       }

//       // Salva no banco de dados principal
//       const [result] = await pool.execute(
//         `INSERT INTO comprovantes (data, usuarioComprovante, cartaoComprovante, motivoComprovante, valorComprovante, linkComprovante)
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [
//           dataComprovante,
//           usuarioComprovante,
//           cartaoComprovante,
//           motivoComprovante,
//           valorComprovante,
//           linkComprovante,
//         ],
//       );

//       return NextResponse.json({
//         message: "Comprovante adicionado com sucesso.",
//         caminhoSalvo: linkComprovante,
//         result,
//       });
//     }
//     // 3. Fluxo de EDIÇÃO (Update)
//     else {
//       // Busca o link antigo para gerenciar a limpeza se necessário
//       const [rows] = await pool.execute<RowDataPacket[]>(
//         "SELECT linkComprovante FROM comprovantes WHERE idComprovante = ?",
//         [idComprovante],
//       );
//       const linkAntigo = rows[0]?.linkComprovante;

//       // Se enviou um novo link e ele é diferente do antigo, remove o arquivo antigo da nuvem
//       if (linkComprovante && linkAntigo && linkAntigo !== linkComprovante) {
//         const fileKey = linkAntigo.split("/f/")[1];
//         if (fileKey) {
//           try {
//             await utapi.deleteFiles(fileKey);
//           } catch (err) {
//             console.error("Erro ao remover arquivo antigo da nuvem:", err);
//           }
//         }
//       }

//       // Define se usa o novo link ou mantém o antigo caso nenhum arquivo novo tenha sido enviado
//       const linkParaSalvar = linkComprovante || linkAntigo || "";

//       const [result] = await pool.execute(
//         `UPDATE comprovantes
//          SET data = ?, usuarioComprovante = ?, cartaoComprovante = ?, motivoComprovante = ?, valorComprovante = ?, linkComprovante = ?
//          WHERE idComprovante = ?`,
//         [
//           dataComprovante,
//           usuarioComprovante,
//           cartaoComprovante,
//           motivoComprovante,
//           valorComprovante,
//           linkParaSalvar,
//           idComprovante,
//         ],
//       );

//       return NextResponse.json({
//         message: "Comprovante atualizado com sucesso.",
//         result,
//       });
//     }
//   } catch (error) {
//     return NextResponse.json(
//       { erro: (error as Error).message },
//       { status: 500 },
//     );
//   }
// }
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

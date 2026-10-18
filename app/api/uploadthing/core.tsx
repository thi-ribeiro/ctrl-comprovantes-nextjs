import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  comprovanteUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    // O middleware pode receber parâmetros enviados pelo frontend ou calcular ano/mês
    .middleware(async ({ req }) => {
      const agora = new Date();
      const ano = agora.getFullYear();
      const mes = String(agora.getMonth() + 1).padStart(2, "0");

      return { ano, mes };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // metadata traz { ano, mes } definidos no middleware
      console.log(
        `Arquivo do período ${metadata.ano}/${metadata.mes} enviado:`,
        file.ufsUrl,
      );

      return {
        fileUrl: file.ufsUrl,
        ano: metadata.ano,
        mes: metadata.mes,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

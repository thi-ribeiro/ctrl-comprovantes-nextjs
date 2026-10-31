import React, { useState } from "react";
import { HiOutlinePlus } from "react-icons/hi";
import ModalDrawer from "../ModalDrawer/ModalDrawer";
import { useComprovantes } from "@/app/Contexto/ComprovanteContext";
import { uploadFiles } from "@/app/utils/uploadthing";

interface AdicionarComprovanteProps {
  loadingEnd?: boolean;
}

export default function AdicionarComprovante({
  loadingEnd = false,
}: AdicionarComprovanteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState("Adicionar");

  const { fetchDataComprovantes, fetchDataMesesAnos, selecionarMes } =
    useComprovantes();

  const handleAdicionarSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    const dataComprovanteStr = formData.get("dataComprovante") as string;
    const usuarioComprovante = formData.get("usuarioComprovante") as string;
    const cartaoComprovante = formData.get("cartaoComprovante") as string;
    const motivoComprovante = formData.get("motivoComprovante") as string;
    const valorComprovante = formData.get("valorComprovante") as string;
    const file = formData.get("arquivoComprovante") as File | null;

    if (!file || file.size === 0) {
      alert("Por favor, selecione um arquivo de comprovante.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Salva o arquivo no Servidor Local Express (Obrigatório)
      setLoadingText("Copiando para o servidor local...");
      const formDataLocal = new FormData();
      formDataLocal.append("data", dataComprovanteStr);
      formDataLocal.append("comprovante", file);

      const resLocal = await fetch("http://192.168.1.14:666/salvar-arquivo", {
        method: "POST",
        body: formDataLocal,
      });

      if (!resLocal.ok) {
        throw new Error(
          "Não foi possível salvar no servidor local. Upload cancelado.",
        );
      }

      const jsonLocal = await resLocal.json();
      const nomeArquivoLocal = jsonLocal.nomeArquivo || "";

      console.log(
        "Cópia salva com sucesso no servidor local:",
        nomeArquivoLocal,
      );

      // 2. Backup na Nuvem (Uploadthing)
      setLoadingText("Enviando backup para a nuvem...");
      const uploadRes = await uploadFiles("comprovanteUploader", {
        files: [file],
      });

      if (!uploadRes || uploadRes.length === 0) {
        throw new Error("Falha ao fazer upload de backup para a nuvem.");
      }

      const linkComprovante = uploadRes[0].url;

      // 3. Registo na Base de Dados SQL
      setLoadingText("Salvando no banco SQL...");
      const response = await fetch(
        "/Routes/Comprovantes/AdicionarComprovante",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataComprovante: dataComprovanteStr,
            usuarioComprovante,
            cartaoComprovante,
            motivoComprovante,
            valorComprovante,
            linkComprovante,
            nomeArquivo: nomeArquivoLocal,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.erro || "Erro ao adicionar comprovante no banco.",
        );
      }

      console.log("Resultado do banco:", result);

      // 4. Atualização do Estado
      if (dataComprovanteStr) {
        const [ano, mes] = dataComprovanteStr.split("-");

        await fetchDataMesesAnos();
        await selecionarMes(mes);
        await fetchDataComprovantes(ano, mes);
      }

      formElement.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Erro no processo de salvamento:", error);
      alert((error as Error).message || "Falha ao salvar comprovante.");
    } finally {
      setIsSubmitting(false);
      setLoadingText("Adicionar");
    }
  };

  if (!loadingEnd) {
    return null;
  }

  return (
    <>
      <div className="adicionar-comprovante" onClick={() => setIsOpen(true)}>
        <HiOutlinePlus />
      </div>

      <ModalDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        titulo="Adicionar Comprovante"
      >
        <form onSubmit={handleAdicionarSubmit}>
          <input
            type="date"
            name="dataComprovante"
            placeholder="Data do Comprovante"
            defaultValue={new Date().toISOString().split("T")[0]}
            required
          />

          <input
            type="text"
            name="usuarioComprovante"
            placeholder="Usuário responsável"
            required
          />

          <div className="form-comprovante-dados">
            <input
              type="text"
              name="cartaoComprovante"
              id="cartaoComprovante"
              placeholder="Selecione ou digite o cartão..."
              list="lista-cartoes"
              required
            />

            <datalist id="lista-cartoes">
              <option value="Banestes" />
              <option value="Caixa" />
              <option value="Bradesco" />
            </datalist>
          </div>

          <div className="form-comprovante-dados">
            <input
              type="text"
              name="motivoComprovante"
              id="motivoComprovante"
              placeholder="Selecione ou digite o motivo..."
              list="lista-motivos"
              required
            />

            <datalist id="lista-motivos">
              <option value="Conta de Água" />
              <option value="Conta de Internet" />
              <option value="Conta de Luz" />
              <option value="Conta de Telefone" />
              <option value="Corte de Cabelo" />
              <option value="Email" />
              <option value="Farmácia" />
              <option value="Gás" />
              <option value="Iptu" />
              <option value="Jardim da Paz" />
              <option value="Outros" />
              <option value="Plano de Saúde" />
              <option value="Ração" />
              <option value="Supermercado" />
              <option value="Salário Gustavo" />
            </datalist>
          </div>

          <input
            step="0.01"
            min="0"
            id="valorComprovante"
            placeholder="Valor"
            type="number"
            name="valorComprovante"
            required
          />

          <input
            type="file"
            name="arquivoComprovante"
            accept=".pdf,.jpg,.jpeg,.png"
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? loadingText : "Adicionar"}
          </button>
        </form>
      </ModalDrawer>
    </>
  );
}

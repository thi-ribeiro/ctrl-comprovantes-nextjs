import React, { useState, useEffect } from "react";
import ModalDrawer from "../ModalDrawer/ModalDrawer";
import { useComprovantes } from "@/app/Contexto/ComprovanteContext";
import { Comprovante2 } from "../../types";
import { uploadFiles } from "@/app/utils/uploadthing";
import { CgSoftwareDownload } from "react-icons/cg";

interface EditarComprovanteProps {
  itemSelecionado: Comprovante2 | null;
  onClose: () => void;
}

export default function EditarComprovante({
  itemSelecionado,
  onClose,
}: EditarComprovanteProps) {
  const { fetchDataComprovantes } = useComprovantes();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState("Editar");

  useEffect(() => {
    if (itemSelecionado) {
      const frame = requestAnimationFrame(() => {
        setIsOpen(true);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [itemSelecionado]);

  const handleFecharAnimado = () => {
    setIsOpen(false);
    const timer = setTimeout(() => {
      onClose();
    }, 250);
    return () => clearTimeout(timer);
  };

  const handleEditarSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    const dataComprovanteStr = formData.get("dataComprovante") as string;
    const usuarioComprovante = formData.get("usuarioComprovante") as string;
    const cartaoComprovante = formData.get("cartaoComprovante") as string;
    const motivoComprovante = formData.get("motivoComprovante") as string;
    const valorComprovante = formData.get("valorComprovante") as string;
    const file = formData.get("arquivoComprovante") as File | null;

    setIsSubmitting(true);
    let linkComprovante = itemSelecionado?.linkComprovante || "";

    try {
      // Se o utilizador seleccionou um novo arquivo, faz o upload para o Uploadthing primeiro
      if (file && file.size > 0) {
        setLoadingText("Enviando arquivo...");
        const uploadRes = await uploadFiles("comprovanteUploader", {
          files: [file],
        });

        if (!uploadRes || uploadRes.length === 0) {
          throw new Error("Falha ao fazer upload do novo arquivo.");
        }

        linkComprovante = uploadRes[0].ufsUrl || uploadRes[0].url;
      }

      setLoadingText("Salvando alterações...");
      const response = await fetch(
        `/Routes/Comprovantes/AdicionarComprovante/`,
        {
          method: "POST",
          body: JSON.stringify({
            data: {
              idComprovante: itemSelecionado?.idComprovante,
              dataComprovante: dataComprovanteStr,
              usuarioComprovante,
              cartaoComprovante,
              motivoComprovante,
              valorComprovante,
              linkComprovante, // Envia o novo link ou mantém o antigo caso não tenha trocado
            },
          }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.erro || "Erro ao editar comprovante.");
      }

      if (dataComprovanteStr) {
        const dataMes = new Date(dataComprovanteStr);
        const ano = dataMes.getFullYear().toString();
        const mes = (dataMes.getMonth() + 1).toString().padStart(2, "0");

        fetchDataComprovantes(ano, mes);
      }

      handleFecharAnimado();
    } catch (error) {
      console.error("Erro ao editar comprovante:", error);
      alert((error as Error).message || "Falha ao actualizar comprovante.");
    } finally {
      setIsSubmitting(false);
      setLoadingText("Editar");
    }
  };

  if (!itemSelecionado) {
    return null;
  }

  return (
    <ModalDrawer
      isOpen={isOpen}
      onClose={handleFecharAnimado}
      titulo="Editar Comprovante"
    >
      <form key={itemSelecionado.idComprovante} onSubmit={handleEditarSubmit}>
        <input
          type="date"
          name="dataComprovante"
          defaultValue={
            itemSelecionado.data ? itemSelecionado.data.slice(0, 10) : ""
          }
          required
        />

        <input
          type="text"
          name="usuarioComprovante"
          placeholder="Usuário responsável"
          required
          defaultValue={itemSelecionado.usuarioComprovante}
        />

        <div className="form-comprovante-dados">
          <input
            type="text"
            name="cartaoComprovante"
            placeholder="Selecione ou digite o cartão..."
            list="lista-cartoes"
            required
            defaultValue={itemSelecionado.cartaoComprovante}
            autoComplete="off"
            onFocus={(e) => e.target.select()}
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
            placeholder="Selecione ou digite o motivo..."
            list="lista-motivos"
            required
            defaultValue={itemSelecionado.motivoComprovante}
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
          type="number"
          name="valorComprovante"
          placeholder="Valor"
          defaultValue={Number(itemSelecionado.valorComprovante ?? 0).toFixed(
            2,
          )}
          required
        />

        <input
          type="file"
          name="arquivoComprovante"
          accept=".pdf,.jpg,.jpeg,.png"
          // O arquivo na edição é opcional (se não escolher nenhum, mantém o atual)
        />

        <div className="edit-link-comprovante">
          <h1>Link atual: </h1>
          <a
            href={itemSelecionado.linkComprovante}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              window.open(itemSelecionado.linkComprovante, "_blank")
            }
          >
            {itemSelecionado.linkComprovante}
          </a>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? loadingText : "Editar"}
        </button>
      </form>
    </ModalDrawer>
  );
}

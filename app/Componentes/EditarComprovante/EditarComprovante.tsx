import React, { useState, useEffect } from "react";
import ModalDrawer from "../ModalDrawer/ModalDrawer";
import { useComprovantes } from "@/app/Contexto/ComprovanteContext";
import { Comprovante2 } from "../../types";
import { uploadFiles } from "@/app/utils/uploadthing";

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

  const handleEditarSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    id: string | number,
  ) => {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.currentTarget);
    const dataComprovante = formData.get("dataComprovante") as string;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/Routes/Comprovantes/EditarComprovante/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            idComprovante: id,
            dataComprovante,
            usuarioComprovante: formData.get("usuarioComprovante"),
            cartaoComprovante: formData.get("cartaoComprovante"),
            motivoComprovante: formData.get("motivoComprovante"),
            valorComprovante: formData.get("valorComprovante"),
          },
        }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.erro || "Erro ao editar comprovante.");

      if (dataComprovante) {
        const [ano, mes] = dataComprovante.split("-");
        fetchDataComprovantes(ano, mes);
      }

      handleFecharAnimado();
    } catch (error) {
      console.error("Erro ao editar comprovante:", error);
      alert((error as Error).message || "Falha ao atualizar comprovante.");
    } finally {
      setIsSubmitting(false);
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
      <form
        key={itemSelecionado.idComprovante}
        onSubmit={(e) => handleEditarSubmit(e, itemSelecionado.idComprovante)}
      >
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

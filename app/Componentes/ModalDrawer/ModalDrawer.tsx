import React from "react";
import styles from "./ModalDrawer.module.css";

interface ModalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  titulo?: string; // <- Adiciona o título aqui
  children?: React.ReactNode; // <- Adiciona o children aqui
}

export default function ModalDrawer({
  isOpen,
  onClose,
  titulo = "Modal drawer", // Valor padrão para o título
  children,
}: ModalDrawerProps) {
  return (
    <div
      className={`${styles["modal-overlay"]} ${isOpen ? styles.open : ""}`}
      onClick={onClose}
    >
      <div
        className={styles["drawer-panel"]}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles["drawer-header"]}>
          <h2>{titulo || "Cadastro"}</h2>
          <button onClick={onClose}>&times;</button>
        </div>

        {/* O conteúdo dinâmico entra aqui dentro do body */}
        <div className={styles["drawer-body"]}>
          {children || <p>Nenhum conteúdo informado.</p>}
        </div>
      </div>
    </div>
  );
}

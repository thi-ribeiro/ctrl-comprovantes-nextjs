import React from "react";
import styles from "./ModalDrawer.module.css";

interface ModalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  titulo?: string; // <- Adiciona o título aqui
  children?: React.ReactNode; // <- Adiciona o children aqui
  loading?: boolean; // <- Adiciona o loading aqui
}

export default function ModalDrawer({
  isOpen,
  onClose,
  titulo = "Modal drawer", // Valor padrão para o título
  children,
  loading = false, // Valor padrão para o loading
}: ModalDrawerProps) {
  const handleOverlayClick = () => {
    if (loading) return;
    onClose();
  };

  return (
    <div
      className={`${styles["modal-overlay"]} ${isOpen ? styles.open : ""}`}
      onClick={handleOverlayClick}
    >
      <div
        className={styles["drawer-panel"]}
        onClick={(e) => {
          e.stopPropagation();
          console.log("Drawer panel clicked");
        }}
      >
        <div className={styles["drawer-header"]}>
          <h2>{titulo || "Cadastro"}</h2>
          <button onClick={onClose}>&times;</button>
        </div>
        <div className={styles["drawer-body"]}>
          {children || <p>Nenhum conteúdo informado.</p>}
        </div>
      </div>
    </div>
  );
}

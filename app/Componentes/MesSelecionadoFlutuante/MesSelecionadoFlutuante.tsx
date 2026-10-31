"use client";

import { useEffect, useRef, useState } from "react";
import { useComprovantes } from "@/app/Contexto/ComprovanteContext";

export const MesSelecionadoFlutuante = () => {
  const { mesSelecionado, nomeDoMes, loadingComprovantes } = useComprovantes();
  const [ativo, setAtivo] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    const iniciar = () => {
      clearTimeout(timeoutRef.current);
      setAtivo(true);
    };

    const pararComDelay = () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setAtivo(false), 600);
    };

    const onAtividade = () => {
      iniciar();
      pararComDelay();
    };

    window.addEventListener("touchstart", iniciar, { passive: true });
    window.addEventListener("touchend", pararComDelay);
    window.addEventListener("touchcancel", pararComDelay);
    window.addEventListener("scroll", onAtividade, {
      passive: true,
      capture: true,
    });
    window.addEventListener("wheel", onAtividade, { passive: true });

    return () => {
      clearTimeout(timeoutRef.current);
      window.removeEventListener("touchstart", iniciar);
      window.removeEventListener("touchend", pararComDelay);
      window.removeEventListener("touchcancel", pararComDelay);
      window.removeEventListener("scroll", onAtividade, { capture: true });
      window.removeEventListener("wheel", onAtividade);
    };
  }, []);

  if (!mesSelecionado || loadingComprovantes) return null;

  return (
    <div className={`MesSelecionado-flutuante ${ativo ? "transparente" : ""}`}>
      {nomeDoMes(mesSelecionado)}
    </div>
  );
};

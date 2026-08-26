'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import styles from '../../../../platform.module.css';

export function ProductContractForm() {
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  if (saved) {
    return (
      <div className={styles.successCard} role="status">
        <span>✓</span><h2>Produto adicionado à empresa</h2>
        <p>As 6 fases e as perguntas da versão 1 foram copiadas para a Viação Horizonte. A implementação já pode ser acompanhada.</p>
        <Link className={styles.button} href="/empresas/viacao-horizonte">Ver empresa e fases</Link>
      </div>
    );
  }

  return (
    <form className={styles.blockerForm} onSubmit={submit}>
      <div className={styles.formIntro}><strong>O que acontece ao confirmar?</strong><p>O sistema cria uma implementação para a empresa usando uma cópia da versão escolhida. As respostas ficarão vinculadas a essa empresa, sem alterar o modelo original do produto.</p></div>
      <div className={styles.formGrid}>
        <label>Produto<select name="product" defaultValue="GD_FROTAS"><option value="GD_FROTAS">GD Frotas</option></select></label>
        <label>Versão do template<select name="version" defaultValue="1"><option value="1">Versão 1 — Publicada</option></select></label>
        <label>Responsável GD Tech<select name="implementer" defaultValue="CARLOS"><option value="CARLOS">Carlos Implementador</option><option value="ANA">Ana Admin</option></select></label>
        <label>Responsável do cliente<select name="clientOwner" defaultValue="RAFAEL"><option value="RAFAEL">Rafael Champion</option><option value="MARINA">Marina Proprietária</option></select></label>
        <label>Data de início<input name="startDate" type="date" defaultValue="2026-08-25" /></label>
        <label>Previsão de conclusão<input name="endDate" type="date" /></label>
      </div>
      <div className={styles.copyPreview}>
        <span>GD Frotas · versão 1</span><strong>10 fases e 49 perguntas serão vinculadas</strong><p>Cada pergunta será copiada para a empresa e poderá ser respondida e acompanhada dentro da implementação.</p>
      </div>
      <div className={styles.formActions}><Link href="/empresas/viacao-horizonte">Cancelar</Link><button className={styles.button} type="submit">Adicionar produto e criar implementação</button></div>
    </form>
  );
}

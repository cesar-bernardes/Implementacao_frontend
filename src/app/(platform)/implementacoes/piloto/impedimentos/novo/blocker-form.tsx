'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import styles from '../../../../platform.module.css';

export function BlockerForm() {
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  if (saved) {
    return (
      <div className={styles.successCard} role="status">
        <span>✓</span>
        <h2>Impedimento registrado</h2>
        <p>Ele já passa a fazer parte do acompanhamento desta implementação.</p>
        <Link className={styles.button} href="/implementacoes/piloto">Voltar ao status</Link>
      </div>
    );
  }

  return (
    <form className={styles.blockerForm} onSubmit={submit}>
      <div className={styles.formIntro}>
        <strong>Quando usar este cadastro?</strong>
        <p>Pendências de pergunta, evidência e aprovação são criadas automaticamente. Use este formulário para registrar um impedimento externo ou uma exceção da operação.</p>
      </div>

      <label className={styles.fullField}>Título do impedimento<input name="title" required placeholder="Ex.: Liberação de acesso ao pátio" /></label>
      <label className={styles.fullField}>Descrição<textarea name="description" required rows={4} placeholder="Explique o que aconteceu e o que é necessário para liberar o avanço." /></label>

      <div className={styles.formGrid}>
        <label>Origem<select name="origin" defaultValue="CLIENT"><option value="CLIENT">Cliente</option><option value="GDTECH">GD Tech</option><option value="THIRD_PARTY">Terceiro</option></select></label>
        <label>Prioridade<select name="priority" defaultValue="HIGH"><option value="HIGH">Alta</option><option value="MEDIUM">Média</option><option value="LOW">Baixa</option></select></label>
        <label>Responsável<input name="owner" required placeholder="Nome do responsável" /></label>
        <label>Prazo<input name="dueDate" type="date" /></label>
        <label>Fase<select name="phase" defaultValue="F01"><option value="F01">F01 · Qualificação e logística</option><option value="F02">F02 · Kickoff e diagnóstico</option></select></label>
        <label>Pergunta relacionada<select name="question" defaultValue=""><option value="">Nenhuma</option><option value="PR-06">PR-06 · Controle de quilometragem</option><option value="PR-10">PR-10 · Internet nos pontos de uso</option></select></label>
      </div>

      <label className={styles.checkField}><input type="checkbox" name="blocksProgress" defaultChecked /><span><strong>Este item bloqueia o avanço</strong><small>A fase não poderá ser concluída enquanto o impedimento estiver aberto.</small></span></label>

      <div className={styles.formActions}><Link href="/implementacoes/piloto">Cancelar</Link><button className={styles.button} type="submit">Registrar impedimento</button></div>
    </form>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { productPhases, viacaoHorizonteCompanyResponses } from '../../_data/demo';
import styles from '../platform.module.css';

export function ImplementationMonitor() {
  const [responses, setResponses] = useState<Record<string, string>>(viacaoHorizonteCompanyResponses);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const saved = window.localStorage.getItem('gdtech.companyResponses');
      if (saved) {
        try { setResponses({ ...viacaoHorizonteCompanyResponses, ...(JSON.parse(saved) as Record<string, string>) }); } catch { /* mantém a demonstração */ }
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, []);

  const implementation = useMemo(() => {
    const total = productPhases.reduce((sum, phase) => sum + phase.questions.length, 0);
    const completed = productPhases.reduce((sum, phase) => sum + phase.questions.filter(([code]) => responses[code] === 'Concluído').length, 0);
    const currentPhase = productPhases.filter((phase) => phase.questions.some(([code]) => responses[code])).at(-1) ?? productPhases[0];
    return { total, completed, currentPhase, percent: Math.round((completed / total) * 100) };
  }, [responses]);

  return (
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <thead><tr><th>Implementação</th><th>Empresa</th><th>Produto contratado</th><th>Fase atual</th><th>Responsável</th><th>Progresso</th><th>Status</th></tr></thead>
        <tbody><tr>
          <td><strong>Implantação piloto — Viação Horizonte</strong><small className={styles.tableNote}>Criada pelo produto contratado</small></td>
          <td><Link className={styles.rowLink} href="/empresas/viacao-horizonte">Viação Horizonte</Link></td>
          <td><span className={styles.productTag}>GD Frotas · v1</span></td>
          <td><strong>{implementation.currentPhase.code}</strong><small className={styles.tableNote}>{implementation.currentPhase.name}</small></td>
          <td>Carlos Implementador</td>
          <td><div className={styles.inlineProgress}><div className={styles.progressTrack}><i style={{ width: `${implementation.percent}%` }} /></div><span>{implementation.percent}%</span></div></td>
          <td><Link href="/implementacoes/piloto" className={styles.statusButton}><i />Em implementação <b>›</b></Link></td>
        </tr></tbody>
      </table>
    </div>
  );
}

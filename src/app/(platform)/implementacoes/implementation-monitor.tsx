'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '../../../lib/api';
import styles from '../platform.module.css';

type Implementation = {
  id: string;
  name: string;
  status: string;
  startedAt: string | null;
  dueAt: string | null;
  estimatedWeeks: number;
  plannedMeetings: number;
  selectedPhaseCodes: string[] | null;
  organization: { tradeName: string };
  owner: { name: string } | null;
  templateVersion: { version: number; template: { name: string; product: { name: string } } };
};

const statusLabels: Record<string, string> = {
  PLANNED: 'Planejada', ACTIVE: 'Em implementação', PAUSED: 'Pausada', COMPLETED: 'Concluída', CANCELED: 'Cancelada',
};

export function ImplementationMonitor() {
  const [implementations, setImplementations] = useState<Implementation[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<Implementation[]>('/implementations').then(setImplementations).catch(() => setError('Não foi possível carregar as implementações autorizadas.'));
  }, []);

  if (error) return <div className={styles.card}><h2>Falha ao carregar</h2><p>{error}</p></div>;
  if (!implementations) return <div className={styles.card}><p>Carregando implementações…</p></div>;
  if (!implementations.length) return <div className={styles.card}><h2>Nenhuma implementação cadastrada</h2><p>Use “Iniciar implementação” para associar uma empresa a uma versão publicada do produto.</p></div>;

  return <div className={styles.tableCard}><table className={styles.table}>
    <thead><tr><th>Implementação</th><th>Empresa</th><th>Produto contratado</th><th>Responsável</th><th>Período</th><th>Planejamento</th><th>Status</th><th /></tr></thead>
    <tbody>{implementations.map((implementation) => <tr key={implementation.id}>
      <td><strong>{implementation.name}</strong></td>
      <td>{implementation.organization.tradeName}</td>
      <td><span className={styles.productTag}>{implementation.templateVersion.template.product.name} · V{implementation.templateVersion.version}</span></td>
      <td>{implementation.owner?.name ?? 'Não definido'}</td>
      <td className={styles.muted}>{implementation.startedAt ? new Date(implementation.startedAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'A definir'} → {implementation.dueAt ? new Date(implementation.dueAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'A definir'}</td>
      <td className={styles.muted}>{implementation.estimatedWeeks || 0} sem. · {implementation.plannedMeetings || 0} reuniões</td>
      <td><span className={styles.pill}>{statusLabels[implementation.status] ?? implementation.status}</span></td>
      <td><Link className={styles.secondaryButton} href={`/implementacoes/${implementation.id}`}>Abrir etapas</Link></td>
    </tr>)}</tbody>
  </table></div>;
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';
import styles from '../platform.module.css';

type Organization = {
  id: string;
  tradeName: string;
  document: string | null;
  active: boolean;
  memberships: Array<{ id: string; role: string; status: string }>;
  implementations: Array<{ id: string; status: string }>;
};

export default function Companies() {
  return (
    <main className={styles.main}>
      <div className={styles.heading}>
        <div><span>Cadastro, produtos contratados e isolamento multiempresa</span><h1>Empresas</h1></div>
        <Link className={styles.button} href="/empresas/nova">+ Cadastrar empresa</Link>
      </div>
      <div className={styles.flowHint}>
        <span>1</span><strong>Cadastre a empresa</strong><i>→</i><span>2</span><strong>Adicione o produto comprado</strong><i>→</i><span>3</span><strong>Acompanhe as respostas na implementação</strong>
      </div>
      <OrganizationsTable />
    </main>
  );
}

function OrganizationsTable() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest<Organization[]>('/organizations')
      .then((data) => { if (active) setOrganizations(data); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Não foi possível carregar as empresas.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <div className={styles.tableCard}>Carregando empresas do banco…</div>;
  if (error) return <div className={styles.tableCard}><strong>Não foi possível carregar as empresas.</strong><p className={styles.muted}>{error}</p></div>;
  if (!organizations.length) return <div className={styles.tableCard}>Nenhuma empresa cadastrada.</div>;

  return (
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <thead><tr><th>Empresa</th><th>Documento</th><th>Produtos</th><th>Implementações</th><th>Membros</th><th>Status</th><th /></tr></thead>
        <tbody>{organizations.map((organization) => (
          <tr key={organization.id}>
            <td><strong>{organization.tradeName}</strong></td>
            <td className={styles.muted}>{organization.document ?? '—'}</td>
            <td><span className={styles.muted}>Consultar produtos</span></td>
            <td>{organization.implementations.length}</td>
            <td>{organization.memberships.length}</td>
            <td><span className={styles.pill}>{organization.active ? 'Ativa' : 'Inativa'}</span></td>
            <td><Link className={styles.secondaryButton} href={`/empresas/${organization.id}/editar`}>Editar empresa</Link></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

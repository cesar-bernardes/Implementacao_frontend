'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';
import styles from '../platform.module.css';

type Organization = {
  id: string;
  tradeName: string;
  implementations: Array<{ id: string; status: string }>;
  memberships: Array<{ id: string }>;
};

export default function Dashboard() {
  const [organizations, setOrganizations] = useState<Organization[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<Organization[]>('/organizations').then(setOrganizations).catch(() => setError('Não foi possível carregar os dados autorizados.'));
  }, []);

  const implementations = organizations?.flatMap((organization) => organization.implementations) ?? [];
  const activeImplementations = implementations.filter((implementation) => !['COMPLETED', 'CANCELED'].includes(implementation.status)).length;
  const linkedMembers = organizations?.reduce((total, organization) => total + organization.memberships.length, 0) ?? 0;

  return <main className={styles.main}>
    <div className={styles.heading}><div><span>Dados conforme o seu nível de acesso</span><h1>Visão geral</h1></div></div>
    {error ? <section className={styles.card}><p>{error}</p></section> : null}
    <section className={styles.stats}>
      <article className={styles.stat}><span>Empresas visíveis</span><strong>{organizations?.length ?? '—'}</strong><small>Somente empresas autorizadas</small></article>
      <article className={styles.stat}><span>Implementações ativas</span><strong>{organizations ? activeImplementations : '—'}</strong><small>Em execução no momento</small></article>
      <article className={styles.stat}><span>Total de implementações</span><strong>{organizations ? implementations.length : '—'}</strong><small>Histórico acessível</small></article>
      <article className={styles.stat}><span>Vínculos visíveis</span><strong>{organizations ? linkedMembers : '—'}</strong><small>Conforme sua permissão</small></article>
    </section>
    <section className={styles.card} style={{ marginTop: 16 }}>
      <h2>{organizations?.length ? 'Empresas disponíveis para você' : 'Nenhuma empresa disponível'}</h2>
      <p>{organizations?.length ? organizations.map((organization) => organization.tradeName).join(', ') : 'Seu acesso ainda não possui uma empresa ativa vinculada.'}</p>
    </section>
  </main>;
}

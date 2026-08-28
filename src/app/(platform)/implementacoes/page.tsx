'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';
import { ImplementationMonitor } from './implementation-monitor';
import styles from '../platform.module.css';

export default function Implementations() {
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);

  useEffect(() => {
    apiRequest<{ globalRole: string }>('/auth/me').then((user) => setIsGlobalAdmin(user.globalRole === 'GLOBAL_ADMIN')).catch(() => undefined);
  }, []);

  return <main className={styles.main}><div className={styles.heading}><div><span>Projetos em execução</span><h1>Implementações</h1></div>{isGlobalAdmin ? <Link className={styles.button} href="/implementacoes/nova">+ Iniciar implementação</Link> : null}</div><ImplementationMonitor /></main>;
}

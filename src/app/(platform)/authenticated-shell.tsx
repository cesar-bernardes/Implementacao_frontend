'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { Nav } from './nav';
import styles from './platform.module.css';
import shellStyles from './authenticated-shell.module.css';

type CurrentUser = {
  name: string;
  globalRole: 'GLOBAL_ADMIN' | 'GLOBAL_RESTRICTED' | 'USER';
  memberships: Array<{ role: string; organization: { tradeName: string } }>;
};

export function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    apiRequest<CurrentUser>('/auth/me')
      .then(setUser)
      .catch(() => router.replace('/login'));
  }, [router]);

  const isGlobalAdmin = user?.globalRole === 'GLOBAL_ADMIN';
  const restrictedPrefixes = ['/empresas', '/templates', '/perguntas', '/usuarios', '/auditoria', '/implementacoes/piloto', '/implementacoes/nova'];
  const isRestrictedPage = !isGlobalAdmin && restrictedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  useEffect(() => {
    if (user && isRestrictedPage) router.replace('/dashboard');
  }, [isRestrictedPage, router, user]);

  if (!user) return <main className={styles.main}><p>Validando seu acesso…</p></main>;
  if (isRestrictedPage) {
    return <main className={styles.main}><p>Direcionando para os dados da sua empresa…</p></main>;
  }

  const company = isGlobalAdmin ? 'GD Tech' : (user.memberships[0]?.organization.tradeName ?? 'Empresa');
  const roleLabels: Record<string, string> = { OWNER: 'Dono da empresa', SUPERVISOR: 'Supervisor', IMPLEMENTATION_RESPONSIBLE: 'Responsável pela implementação' };
  const role = isGlobalAdmin ? 'Administrador global' : (roleLabels[user.memberships[0]?.role] ?? 'Colaborador');

  async function logout() {
    setLoggingOut(true);
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/login');
      router.refresh();
    }
  }

  return <div className={styles.shell}><aside className={styles.sidebar}><Link href="/dashboard" className={styles.brand}><b>GD</b> TECH</Link><Nav isGlobalAdmin={isGlobalAdmin}/><div className={styles.account}><strong>{user.name}</strong><span>{role}</span><button type="button" className={shellStyles.logoutButton} disabled={loggingOut} onClick={logout}>{loggingOut ? 'Saindo…' : 'Sair do sistema'}</button></div></aside><div className={styles.content}><header className={styles.topbar}><p>Empresa ativa: <strong>{company}</strong></p><strong>Ambiente real</strong><button type="button" className={shellStyles.mobileLogoutButton} disabled={loggingOut} onClick={logout}>{loggingOut ? 'Saindo…' : 'Sair'}</button></header>{children}</div></div>;
}

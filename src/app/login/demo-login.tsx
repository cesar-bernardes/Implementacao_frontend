'use client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import styles from './login.module.css';
export function DemoLogin() {
  const router = useRouter(); const [pending, startTransition] = useTransition();
  function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); startTransition(() => router.push('/dashboard')); }
  return <section className={styles.panel}><div><p className={styles.kicker}>Acesso seguro</p><h2>Entrar na plataforma</h2><p className={styles.muted}>Use o perfil demonstrativo para navegar.</p></div><form onSubmit={submit}><label>E-mail<input type="email" defaultValue="admin@gdtech.demo" required /></label><label>Senha<input type="password" defaultValue="demonstracao" required /></label><div className={styles.profile}><span>Perfil selecionado</span><strong>Administrador global</strong></div><button type="submit" disabled={pending}>{pending ? 'Entrando…' : 'Entrar no ambiente demo'}</button></form><p className={styles.notice}>Neste momento o login é fictício. A autenticação real será validada exclusivamente pelo backend.</p></section>;
}

'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import styles from './login.module.css';
import { apiRequest } from '../../lib/api';
export function DemoLogin() {
  const router = useRouter(); const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [passwordStep, setPasswordStep] = useState(false);
  useEffect(() => {
    window.localStorage.removeItem('gdtech.auth');
    const hash = window.location.hash;
    const search = window.location.search;
    if (hash.includes('access_token=') || hash.includes('type=recovery') || hash.includes('type=invite') || search.includes('code=')) {
      window.location.replace(`/primeiro-acesso${search}${hash}`);
    }
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      if (!passwordStep) {
        const access = await apiRequest<{ status: 'FIRST_ACCESS' | 'ACTIVE' | 'UNKNOWN' }>('/auth/access-status', { method: 'POST', body: JSON.stringify({ email }) });
        if (access.status === 'FIRST_ACCESS') {
          window.sessionStorage.setItem('gdtech.firstAccessEmail', email);
          router.push(`/primeiro-acesso?email=${encodeURIComponent(email)}`);
          return;
        }
        if (access.status === 'UNKNOWN') { setError('Este e-mail não possui acesso ao sistema.'); return; }
        setPasswordStep(true);
        return;
      }
      await apiRequest<{ user: unknown }>('/auth/login', { method: 'POST', body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) });
      startTransition(() => router.push('/dashboard'));
    } catch { setError('E-mail ou senha inválidos, ou convite ainda não ativado.'); }
  }
  return <section className={styles.panel}><div><p className={styles.kicker}>Acesso seguro</p><h2>Entrar na plataforma</h2><p className={styles.muted}>{passwordStep ? 'Digite sua senha.' : 'Primeiro, informe seu e-mail.'}</p></div><form onSubmit={submit}><label>E-mail<input name="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setPasswordStep(false); }} readOnly={passwordStep} required /></label>{passwordStep ? <label>Senha<input name="password" type="password" autoFocus required /></label> : null}{error ? <p className={styles.notice} role="alert">{error}</p> : null}<div className={styles.profile}><span>Acesso</span><strong>{passwordStep ? 'Usuário ativo' : 'Verificação do cadastro'}</strong></div><button type="submit" disabled={pending}>{pending ? 'Verificando…' : passwordStep ? 'Entrar' : 'Continuar'}</button>{passwordStep ? <button type="button" onClick={() => setPasswordStep(false)}>Trocar e-mail</button> : null}</form><p className={styles.notice}>Se for seu primeiro acesso, o sistema abrirá automaticamente a criação de senha.</p></section>;
}

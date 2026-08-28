'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../lib/api';
import styles from '../login/login.module.css';

export default function FirstAccessPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    setAccessToken(params.get('access_token') ?? '');
    const authError = params.get('error_description');
    if (authError) setError('O link recebido expirou. Use a senha temporária fornecida pelo administrador.');
    const query = new URLSearchParams(window.location.search);
    setEmail(query.get('email') ?? window.sessionStorage.getItem('gdtech.firstAccessEmail') ?? '');
  }, []);

  async function submitTemporary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') ?? '');
    if (password !== String(form.get('confirmation') ?? '')) { setError('As senhas não são iguais.'); return; }
    setSubmitting(true);
    try {
      await apiRequest('/auth/first-access/temporary', { method: 'POST', body: JSON.stringify({ email, temporaryPassword: form.get('temporaryPassword'), password }) });
      completeFirstAccess();
    } catch {
      setError('A senha temporária é inválida. Solicite uma nova ao administrador.');
      setSubmitting(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') ?? '');
    const confirmation = String(form.get('confirmation') ?? '');
    if (password !== confirmation) { setError('As senhas não são iguais.'); return; }
    setSubmitting(true);
    try {
      await apiRequest('/auth/first-access', { method: 'POST', body: JSON.stringify({ accessToken, password }) });
      completeFirstAccess();
    } catch {
      setError('O convite é inválido ou expirou. Solicite um novo convite.');
      setSubmitting(false);
    }
  }

  function completeFirstAccess() {
    window.sessionStorage.removeItem('gdtech.firstAccessEmail');
    window.history.replaceState(null, '', '/primeiro-acesso');
    router.replace('/dashboard');
  }

  return <main className={styles.page}><section className={styles.intro}><div className={styles.logo}><b>GD</b> TECH</div><div><span>PRIMEIRO ACESSO</span><h1>Crie sua senha de acesso.</h1><p>Seu usuário ficará vinculado somente à empresa para a qual foi convidado.</p></div></section><section className={styles.panel}><h2>Definir senha</h2>{accessToken ? <form onSubmit={submit}><label>Nova senha<input name="password" type="password" minLength={8} required /></label><label>Confirmar senha<input name="confirmation" type="password" minLength={8} required /></label>{error ? <p className={styles.notice} role="alert">{error}</p> : null}<button type="submit" disabled={submitting}>{submitting ? 'Entrando…' : 'Salvar senha e entrar'}</button></form> : <form onSubmit={submitTemporary}><p className={styles.muted}>Informe a senha temporária fornecida pelo administrador para <strong>{email || 'seu e-mail'}</strong>.</p><label>Senha temporária<input name="temporaryPassword" type="password" minLength={8} required /></label><label>Nova senha<input name="password" type="password" minLength={8} required /></label><label>Confirmar nova senha<input name="confirmation" type="password" minLength={8} required /></label>{error ? <p className={styles.notice} role="alert">{error}</p> : null}<button type="submit" disabled={!email || submitting}>{submitting ? 'Entrando…' : 'Criar senha e entrar'}</button></form>}</section></main>;
}

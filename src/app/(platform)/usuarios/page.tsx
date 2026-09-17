'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';
import styles from '../platform.module.css';

type GlobalUser = {
  id: string;
  name: string;
  email: string;
  globalRole: 'GLOBAL_ADMIN' | 'GLOBAL_RESTRICTED';
  active: boolean;
  invitationStatus: 'INVITED' | 'ACTIVE';
};

type InviteResponse = { user: GlobalUser; message: string };

const roleLabels = {
  GLOBAL_ADMIN: 'Administrador global',
  GLOBAL_RESTRICTED: 'Gestor global',
} as const;

function errorMessage(error: unknown) {
  if (!(error instanceof Error)) return 'Não foi possível concluir o convite.';
  try {
    const body = JSON.parse(error.message) as { message?: string | string[] };
    return Array.isArray(body.message) ? body.message.join(' ') : body.message ?? error.message;
  } catch {
    return error.message;
  }
}

export default function Users() {
  const [users, setUsers] = useState<GlobalUser[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      setUsers(await apiRequest<GlobalUser[]>('/global-users'));
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await apiRequest<InviteResponse>('/global-users', {
        method: 'POST',
        body: JSON.stringify({
          name: String(form.get('name') ?? ''),
          email: String(form.get('email') ?? ''),
          globalRole: String(form.get('globalRole') ?? 'GLOBAL_RESTRICTED'),
        }),
      });
      setUsers((current) => [...current, response.user].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
      setMessage(response.message);
      setOpen(false);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return <main className={styles.main}>
    <div className={styles.heading}><div><span>Equipe interna da organização principal</span><h1>Usuários globais</h1></div><button type="button" className={styles.button} onClick={() => { setError(''); setMessage(''); setOpen(true); }}>+ Convidar usuário global</button></div>
    <div className={styles.accessNotice}><strong>Acesso da GD Tech</strong><p>Esta lista contém somente usuários globais. Usuários dos clientes são administrados dentro de cada empresa e não aparecem aqui.</p></div>
    {message ? <p className={styles.productMessage} role="status">{message}</p> : null}
    {error && !open ? <p className={styles.formError} role="alert">{error}</p> : null}
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <thead><tr><th>Usuário</th><th>Tipo de acesso</th><th>Status</th></tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={3} className={styles.muted}>Carregando usuários…</td></tr> : null}
          {!loading && !users.length ? <tr><td colSpan={3} className={styles.muted}>Nenhum usuário global cadastrado.</td></tr> : null}
          {users.map((user) => {
            return <tr key={user.id}><td><strong>{user.name}</strong><small className={styles.tableNote}>{user.email}</small></td><td>{roleLabels[user.globalRole]}</td><td><span className={styles.pill}>{!user.active ? 'Inativo' : user.invitationStatus === 'INVITED' ? 'Convite enviado' : 'Ativo'}</span></td></tr>;
          })}
        </tbody>
      </table>
    </div>

    {open ? <div className={styles.editorBackdrop} role="presentation"><form className={styles.questionEditor} role="dialog" aria-modal="true" aria-labelledby="global-user-title" onSubmit={invite}>
      <div className={styles.editorHeader}><div><span>NOVO ACESSO INTERNO</span><h2 id="global-user-title">Convidar usuário global</h2></div><button type="button" className={styles.editorClose} aria-label="Fechar" onClick={() => setOpen(false)}>×</button></div>
      <div className={styles.editorBody}>
        <label className={styles.editorField}>Nome completo<input name="name" minLength={2} placeholder="Nome do colaborador" autoFocus required /></label>
        <label className={styles.editorField}>E-mail corporativo<input name="email" type="email" placeholder="colaborador@granddos.tech" required /></label>
        <label className={styles.editorField}>Tipo de acesso<select name="globalRole" defaultValue="GLOBAL_RESTRICTED"><option value="GLOBAL_RESTRICTED">Gestor global</option><option value="GLOBAL_ADMIN">Administrador global</option></select><small>O administrador possui acesso completo. O gestor acompanha as operações, sem administrar produtos e usuários globais.</small></label>
        {error ? <p className={styles.formError} role="alert">{error}</p> : null}
        <div className={styles.accessNotice}><strong>Primeiro acesso</strong><p>O convite será enviado por e-mail para o colaborador criar a própria senha.</p></div>
      </div>
      <div className={styles.editorActions}><button type="button" className={styles.editorCancel} disabled={saving} onClick={() => setOpen(false)}>Cancelar</button><button type="submit" className={styles.button} disabled={saving}>{saving ? 'Enviando…' : 'Enviar convite'}</button></div>
    </form></div> : null}
  </main>;
}

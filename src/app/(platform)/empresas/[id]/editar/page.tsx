'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiRequest } from '../../../../../lib/api';
import styles from '../../../platform.module.css';

type Member = { id: string; role: 'OWNER' | 'SUPERVISOR' | 'IMPLEMENTATION_RESPONSIBLE'; status: string; user: { name: string; email: string } };
type Organization = { id: string; legalName: string; tradeName: string; document: string | null; segment: string | null; contactEmail: string | null; phone: string | null; city: string | null; state: string | null; memberships: Member[] };

const roleName: Record<Member['role'], string> = { OWNER: 'Dono', SUPERVISOR: 'Supervisor', IMPLEMENTATION_RESPONSIBLE: 'Responsável pela implementação' };

export default function EditCompanyPage() {
  const { id } = useParams<{ id: string }>();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { apiRequest<Organization>(`/organizations/${id}`).then((data) => { setOrganization(data); setMembers(data.memberships); }).catch(() => setError('Não foi possível carregar a empresa.')); }, [id]);

  function updateMember(index: number, field: 'name' | 'email' | 'role', value: string) {
    setMembers((current) => current.map((member, position) => position === index ? field === 'role' ? { ...member, role: value as Member['role'] } : { ...member, user: { ...member.user, [field]: value } } : member));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      const updated = await apiRequest<Organization>(`/organizations/${id}`, { method: 'PATCH', body: JSON.stringify({
        legalName: form.get('legalName'), tradeName: form.get('tradeName'), document: form.get('document'), segment: form.get('segment'), contactEmail: form.get('contactEmail'), phone: form.get('phone'), city: form.get('city'), state: form.get('state'),
        members: members.map((member) => ({ id: member.id, name: member.user.name, email: member.user.email, role: member.role })),
      }) });
      setOrganization(updated); setMembers(updated.memberships); setMessage('Empresa e colaboradores atualizados.');
    } catch { setError('Não foi possível salvar. Verifique se os e-mails não estão cadastrados em outro usuário.'); }
    finally { setSaving(false); }
  }

  async function resend(member: Member) {
    setError(''); setMessage('');
    try { await apiRequest(`/organizations/${id}/members/${member.id}/resend-invite`, { method: 'POST' }); setMessage(`Convite reenviado para ${member.user.email}.`); }
    catch { setError(`Não foi possível reenviar o convite para ${member.user.email}.`); }
  }

  async function copyTemporaryAccess(member: Member) {
    setError(''); setMessage('');
    try {
      const result = await apiRequest<{ email: string; temporaryPassword: string }>(`/organizations/${id}/members/${member.id}/temporary-access`, { method: 'POST' });
      await navigator.clipboard.writeText(`Primeiro acesso GD Tech\nE-mail: ${result.email}\nSenha temporária: ${result.temporaryPassword}\nAcesse: https://implementacao-frontend.vercel.app/login`);
      setMessage(`Acesso temporário copiado. Envie-o diretamente para ${member.user.email}.`);
    } catch { setError('Não foi possível gerar o acesso temporário.'); }
  }

  if (!organization) return <main className={styles.main}><p>{error || 'Carregando empresa…'}</p></main>;
  return <main className={`${styles.main} ${styles.narrowMain}`}><div className={styles.heading}><div><span>Cadastro e acesso dos colaboradores</span><h1>Editar empresa</h1></div><Link href="/empresas" className={styles.backLink}>← Voltar às empresas</Link></div><form className={styles.blockerForm} onSubmit={submit}><div className={styles.formSectionTitle}><span>1</span><div><strong>Dados da empresa</strong><p>Confira e corrija as informações principais.</p></div></div><div className={styles.formGrid}><label>Razão social<input name="legalName" defaultValue={organization.legalName} required /></label><label>Nome fantasia<input name="tradeName" defaultValue={organization.tradeName} required /></label><label>CNPJ<input name="document" defaultValue={organization.document ?? ''} /></label><label>Segmento<input name="segment" defaultValue={organization.segment ?? ''} /></label><label>E-mail da empresa<input name="contactEmail" type="email" defaultValue={organization.contactEmail ?? ''} /></label><label>Telefone<input name="phone" defaultValue={organization.phone ?? ''} /></label><label>Cidade<input name="city" defaultValue={organization.city ?? ''} /></label><label>UF<input name="state" maxLength={2} defaultValue={organization.state ?? ''} /></label></div><div className={styles.formSectionTitle}><span>2</span><div><strong>Colaboradores e convites</strong><p>O status muda para ativo depois que o colaborador conclui o primeiro acesso.</p></div></div>{members.map((member, index) => <section className={styles.roleCard} key={member.id}><div className={styles.roleCardHeader}><div><span>{roleName[member.role]}</span><strong>Status do convite: {member.status === 'ACTIVE' ? 'Ativo' : 'Aguardando primeiro acesso'}</strong></div><div><button type="button" className={styles.addPersonButton} onClick={() => resend(member)}>Reenviar e-mail</button><button type="button" className={styles.addPersonButton} onClick={() => copyTemporaryAccess(member)}>Copiar acesso temporário</button></div></div><div className={styles.rolePerson}><label>Nome<input value={member.user.name} onChange={(event) => updateMember(index, 'name', event.target.value)} required /></label><label>E-mail de acesso<input type="email" value={member.user.email} onChange={(event) => updateMember(index, 'email', event.target.value)} required /></label><label>Cargo<select value={member.role} onChange={(event) => updateMember(index, 'role', event.target.value)}><option value="OWNER">Dono</option><option value="SUPERVISOR">Supervisor</option><option value="IMPLEMENTATION_RESPONSIBLE">Responsável</option></select></label></div></section>)}{message ? <p>{message}</p> : null}{error ? <p role="alert">{error}</p> : null}<div className={styles.formActions}><Link href="/empresas">Cancelar</Link><button className={styles.button} type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button></div></form></main>;
}

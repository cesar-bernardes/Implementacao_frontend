'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import styles from '../../platform.module.css';

export function CompanyForm() {
  const [saved, setSaved] = useState(false);
  const [owners, setOwners] = useState([0]);
  const [supervisors, setSupervisors] = useState([0]);
  const [responsibles, setResponsibles] = useState([0]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const companyName = String(form.get('tradeName') ?? 'Nova empresa');
    const users = [
      ...owners.map((index) => ({ name: String(form.get(`owner[${index}].name`) ?? ''), email: String(form.get(`owner[${index}].email`) ?? ''), role: 'Dono', company: companyName })),
      ...supervisors.map((index) => ({ name: String(form.get(`supervisor[${index}].name`) ?? ''), email: String(form.get(`supervisor[${index}].email`) ?? ''), role: 'Supervisor', company: companyName })),
      ...responsibles.map((index) => ({ name: String(form.get(`responsible[${index}].name`) ?? ''), email: String(form.get(`responsible[${index}].email`) ?? ''), role: 'Responsável', company: companyName })),
    ];
    window.localStorage.setItem('gdtech.lastCompanyUsers', JSON.stringify(users));
    setSaved(true);
  }

  if (saved) {
    return (
      <div className={styles.successCard} role="status">
        <span>✓</span><h2>Empresa cadastrada</h2>
        <p>A empresa e seus usuários foram criados. Cada usuário ficou restrito somente a esta empresa.</p>
        <Link className={styles.button} href="/empresas/viacao-horizonte/produtos/novo">Adicionar produto</Link>
      </div>
    );
  }

  return (
    <form className={styles.blockerForm} onSubmit={submit}>
      <div className={styles.formSectionTitle}><span>1</span><div><strong>Dados da empresa</strong><p>Identificação e contato principal do cliente.</p></div></div>
      <div className={styles.formGrid}>
        <label>Razão social<input required name="legalName" placeholder="Nome jurídico da empresa" /></label>
        <label>Nome fantasia<input required name="tradeName" placeholder="Nome usado no sistema" /></label>
        <label>CNPJ<input required name="document" placeholder="00.000.000/0000-00" /></label>
        <label>Segmento<select name="segment" defaultValue="TRANSPORT"><option value="TRANSPORT">Transporte e logística</option><option value="SERVICE">Serviços</option><option value="OTHER">Outro</option></select></label>
        <label>E-mail<input required name="email" type="email" placeholder="contato@empresa.com.br" /></label>
        <label>Telefone<input name="phone" placeholder="(00) 00000-0000" /></label>
        <label>Cidade/UF<input name="location" placeholder="Cuiabá/MT" /></label>
      </div>
      <div className={styles.peopleSection}>
        <div className={styles.formSectionHeading}><div><strong>Responsáveis pela implementação</strong><p>Informe quem terá cada papel na operação. Os três cargos principais são obrigatórios.</p></div></div>
        <RoleCard title="Dono" description="Dono da empresa" role="owner" indexes={owners} onAdd={() => setOwners([...owners, owners.length])} />
        <RoleCard title="Supervisor" description="Quem vai supervisionar a implementação" role="supervisor" indexes={supervisors} onAdd={() => setSupervisors([...supervisors, supervisors.length])} />
        <RoleCard title="Responsável" description="Quem será responsável por toda a implementação" role="responsible" indexes={responsibles} onAdd={() => setResponsibles([...responsibles, responsibles.length])} />
      </div>
      <div className={styles.formActions}><Link href="/empresas">Cancelar</Link><button className={styles.button} type="submit">Cadastrar e continuar</button></div>
    </form>
  );
}

function RoleCard({ title, description, role, indexes, onAdd }: { title: string; description: string; role: string; indexes: number[]; onAdd: () => void }) {
  return (
    <section className={styles.roleCard}>
      <div className={styles.roleCardHeader}><div><span>{title}</span><strong>{description}</strong></div><button type="button" className={styles.addPersonButton} onClick={onAdd}>+ Adicionar {title.toLowerCase()}</button></div>
      <div className={styles.rolePeopleList}>
        {indexes.map((index) => <div className={styles.rolePerson} key={index}>
          <label>Nome<input required name={`${role}[${index}].name`} placeholder={`Nome do ${title.toLowerCase()}`} /></label>
          <label>E-mail<input required name={`${role}[${index}].email`} type="email" placeholder="contato@empresa.com.br" /></label>
          <label>Telefone<input name={`${role}[${index}].phone`} placeholder="(00) 00000-0000" /></label>
        </div>)}
      </div>
    </section>
  );
}

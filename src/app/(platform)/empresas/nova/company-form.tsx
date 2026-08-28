'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from '../../platform.module.css';
import { apiRequest } from '../../../../lib/api';

type CreatedOrganization = { id: string; tradeName: string };
type ModulePhase = { code: string; name: string; order: number; isBase?: boolean; durationWeeks?: number; meetingsPerWeek?: number };
type SetupOptions = {
  products: Array<{ name: string; templates: Array<{ name: string; versions: Array<{ id: string; version: number; definition: { phases?: ModulePhase[] } }> }> }>;
  owners: Array<{ id: string; name: string; email: string }>;
};

export function CompanyForm() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedOrganization | null>(null);
  const [owners, setOwners] = useState([0]);
  const [supervisors, setSupervisors] = useState([0]);
  const [responsibles, setResponsibles] = useState([0]);
  const [options, setOptions] = useState<SetupOptions | null>(null);
  const [versionId, setVersionId] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    apiRequest<SetupOptions>('/implementations/options').then((data) => {
      setOptions(data);
      const version = data.products[0]?.templates[0]?.versions[0];
      if (version) {
        setVersionId(version.id);
        setSelectedModules((version.definition.phases ?? []).map((phase) => phase.code));
      }
    }).catch(() => setError('Não foi possível carregar os produtos e módulos.'));
  }, []);

  const version = useMemo(() => options?.products.flatMap((product) => product.templates.flatMap((template) => template.versions.map((item) => ({ ...item, productName: product.name, templateName: template.name })))).find((item) => item.id === versionId), [options, versionId]);
  const modules = version?.definition.phases ?? [];
  const contractedModules = modules.filter((module) => module.isBase || selectedModules.includes(module.code));
  const estimatedWeeks = contractedModules.reduce((total, module) => total + Math.max(1, Number(module.durationWeeks) || 1), 0);
  const plannedMeetings = contractedModules.reduce((total, module) => total + Math.max(1, Number(module.durationWeeks) || 1) * Math.max(0, Number(module.meetingsPerWeek) || 0), 0);
  const estimatedEnd = startDate && estimatedWeeks ? new Date(`${startDate}T00:00:00Z`).getTime() + estimatedWeeks * 7 * 86400000 : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const companyName = String(form.get('tradeName') ?? 'Nova empresa');
    const users = [
      ...owners.map((index) => ({ name: String(form.get(`owner[${index}].name`) ?? ''), email: String(form.get(`owner[${index}].email`) ?? ''), phone: String(form.get(`owner[${index}].phone`) ?? ''), role: 'OWNER' as const })),
      ...supervisors.map((index) => ({ name: String(form.get(`supervisor[${index}].name`) ?? ''), email: String(form.get(`supervisor[${index}].email`) ?? ''), phone: String(form.get(`supervisor[${index}].phone`) ?? ''), role: 'SUPERVISOR' as const })),
      ...responsibles.map((index) => ({ name: String(form.get(`responsible[${index}].name`) ?? ''), email: String(form.get(`responsible[${index}].email`) ?? ''), phone: String(form.get(`responsible[${index}].phone`) ?? ''), role: 'IMPLEMENTATION_RESPONSIBLE' as const })),
    ];
    const location = String(form.get('location') ?? '').trim();
    const locationMatch = location.match(/^(.+?)(?:\s*\/\s*([A-Za-z]{2}))?$/);
    try {
      const organization = created ?? await apiRequest<CreatedOrganization>('/organizations', {
        method: 'POST', body: JSON.stringify({ legalName: String(form.get('legalName') ?? ''), tradeName: companyName, document: String(form.get('document') ?? ''), segment: String(form.get('segment') ?? ''), contactEmail: String(form.get('email') ?? ''), phone: String(form.get('phone') ?? ''), city: locationMatch?.[1] ?? location, state: locationMatch?.[2] ?? undefined, members: users }),
      });
      setCreated(organization);
      await apiRequest('/implementations', {
        method: 'POST',
        body: JSON.stringify({ organizationId: organization.id, templateVersionId: versionId, ownerId: form.get('implementationOwnerId') || undefined, selectedPhaseCodes: contractedModules.map((module) => module.code), name: `Implementação ${version?.productName ?? 'do produto'} — ${organization.tradeName}`, startedAt: startDate }),
      });
      setSaved(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível cadastrar a empresa.');
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className={styles.successCard} role="status">
        <span>✓</span><h2>Empresa cadastrada</h2>
        <p>{created?.tradeName ?? 'A empresa'}, seus usuários, produto e módulos contratados foram criados. O prazo da implementação foi calculado automaticamente.</p>
        <Link className={styles.button} href="/empresas">Voltar para empresas</Link>
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
      <section className={styles.companyProductSetup}>
        <div className={styles.formSectionTitle}><span>2</span><div><strong>Produto, módulos e prazo</strong><p>Selecione o que a empresa comprou. Módulos base são obrigatórios.</p></div></div>
        {!options ? <p>Carregando produto…</p> : <>
          <div className={styles.formGrid}>
            <label>Produto e versão<select value={versionId} onChange={(event) => { const nextId = event.target.value; setVersionId(nextId); const next = options.products.flatMap((product) => product.templates.flatMap((template) => template.versions)).find((item) => item.id === nextId); setSelectedModules((next?.definition.phases ?? []).map((item) => item.code)); }}>{options.products.flatMap((product) => product.templates.flatMap((template) => template.versions.map((item) => <option key={item.id} value={item.id}>{product.name} · {template.name} · V{item.version}</option>)))}</select></label>
            <label>Responsável GD Tech<select name="implementationOwnerId" defaultValue={options.owners[0]?.id ?? ''} required><option value="" disabled>Selecione</option>{options.owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name} · {owner.email}</option>)}</select></label>
            <label>Início da implementação<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required /></label>
          </div>
          <div className={styles.modulePurchaseGrid}>{modules.map((module) => {
            const checked = module.isBase || selectedModules.includes(module.code);
            return <label className={styles.modulePurchaseCard} data-selected={checked} key={module.code}><input type="checkbox" checked={checked} disabled={module.isBase} onChange={(event) => setSelectedModules((current) => event.target.checked ? [...new Set([...current, module.code])] : current.filter((code) => code !== module.code))} /><span><small>{module.code}{module.isBase ? ' · MÓDULO BASE' : ''}</small><strong>{module.name}</strong><em>{Math.max(1, Number(module.durationWeeks) || 1)} semana(s) · {Math.max(0, Number(module.meetingsPerWeek) || 0)} reunião(ões)/semana</em></span></label>;
          })}</div>
          <div className={styles.implementationEstimate}><div><small>MÓDULOS CONTRATADOS</small><strong>{contractedModules.length}</strong></div><div><small>PRAZO CALCULADO</small><strong>{estimatedWeeks} semanas</strong></div><div><small>REUNIÕES PLANEJADAS</small><strong>{plannedMeetings}</strong></div><div><small>CONCLUSÃO PREVISTA</small><strong>{estimatedEnd ? new Date(estimatedEnd).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—'}</strong></div></div>
        </>}
      </section>
      {error && <p role="alert" className={styles.formError}>{error}</p>}
      <div className={styles.formActions}><Link href="/empresas">Cancelar</Link><button className={styles.button} type="submit" disabled={saving || !versionId || !contractedModules.length}>{saving ? 'Cadastrando…' : 'Cadastrar empresa e iniciar implementação'}</button></div>
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

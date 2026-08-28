'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../../../lib/api';
import styles from '../../platform.module.css';

type ModulePhase = { code: string; name: string; isBase?: boolean; durationWeeks?: number; meetingsPerWeek?: number };
type Options = {
  organizations: Array<{ id: string; tradeName: string }>;
  products: Array<{ name: string; templates: Array<{ name: string; versions: Array<{ id: string; version: number; definition: { phases?: ModulePhase[] } }> }> }>;
  owners: Array<{ id: string; name: string; email: string }>;
};
type VersionOption = { id: string; label: string; productName: string; phases: ModulePhase[] };

function availableVersions(options: Options) {
  return options.products.flatMap((product) => product.templates.flatMap((template) => template.versions.map((version) => ({ id: version.id, productName: product.name, label: `${product.name} · ${template.name} · Versão ${version.version}`, phases: version.definition.phases ?? [] }))));
}

export function NewImplementationForm() {
  const [options, setOptions] = useState<Options | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [versionId, setVersionId] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    apiRequest<Options>('/implementations/options').then((loadedOptions) => {
      setOptions(loadedOptions);
      const firstVersion = availableVersions(loadedOptions)[0];
      if (firstVersion) {
        setVersionId(firstVersion.id);
        setSelectedModules(firstVersion.phases.map((phase) => phase.code));
      }
    }).catch(() => setError('Não foi possível carregar empresas e produtos.'));
  }, []);

  const versions = useMemo<VersionOption[]>(() => options ? availableVersions(options) : [], [options]);

  const version = versions.find((item) => item.id === versionId) ?? versions[0];
  const modules = version?.phases ?? [];
  const contractedModules = modules.filter((module) => module.isBase || selectedModules.includes(module.code));
  const estimatedWeeks = contractedModules.reduce((total, module) => total + Math.max(1, Number(module.durationWeeks) || 1), 0);
  const plannedMeetings = contractedModules.reduce((total, module) => total + Math.max(1, Number(module.durationWeeks) || 1) * Math.max(0, Number(module.meetingsPerWeek) || 0), 0);
  const estimatedEnd = startDate && estimatedWeeks ? new Date(`${startDate}T00:00:00Z`).getTime() + estimatedWeeks * 7 * 86400000 : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest('/implementations', { method: 'POST', body: JSON.stringify({ organizationId: form.get('organizationId'), templateVersionId: versionId, ownerId: form.get('ownerId') || undefined, selectedPhaseCodes: contractedModules.map((module) => module.code), name: form.get('name'), startedAt: startDate }) });
      setSaved(true);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Não foi possível iniciar a implementação.'); }
    finally { setSaving(false); }
  }

  if (saved) return <div className={styles.successCard} role="status"><span>✓</span><h2>Implementação criada</h2><p>Os módulos contratados e o prazo automático foram vinculados à empresa.</p><Link className={styles.button} href="/implementacoes">Ver implementações</Link></div>;
  if (error && !options) return <div className={styles.card}><h2>Não foi possível abrir o cadastro</h2><p>{error}</p></div>;
  if (!options) return <div className={styles.card}><p>Carregando empresas e produtos…</p></div>;
  if (!options.organizations.length) return <div className={styles.card}><h2>Cadastre uma empresa primeiro</h2><Link className={styles.button} href="/empresas/nova">Cadastrar empresa</Link></div>;
  if (!versions.length) return <div className={styles.card}><h2>Publique uma versão do produto primeiro</h2><Link className={styles.button} href="/templates">Ir para Produtos</Link></div>;

  const firstOrganization = options.organizations[0];
  return <form className={styles.blockerForm} onSubmit={submit}>
    <div className={styles.formIntro}><strong>Planejamento automático da implementação</strong><p>Selecione os módulos vendidos. O sistema somará as semanas e reuniões configuradas no Produto.</p></div>
    <div className={styles.formGrid}>
      <label>Empresa<select name="organizationId" defaultValue={firstOrganization.id} required>{options.organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.tradeName}</option>)}</select></label>
      <label>Produto e versão<select value={versionId} onChange={(event) => { const nextId = event.target.value; setVersionId(nextId); const next = versions.find((item) => item.id === nextId); setSelectedModules((next?.phases ?? []).map((module) => module.code)); }}>{versions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label>Nome da implementação<input name="name" defaultValue={`Implementação ${version.productName} — ${firstOrganization.tradeName}`} required minLength={2} /></label>
      <label>Responsável GD Tech<select name="ownerId" defaultValue={options.owners[0]?.id ?? ''} required><option value="" disabled>Selecione</option>{options.owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name} · {owner.email}</option>)}</select></label>
      <label>Data de início<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required /></label>
    </div>
    <div className={styles.modulePurchaseGrid}>{modules.map((module) => { const checked = module.isBase || selectedModules.includes(module.code); return <label className={styles.modulePurchaseCard} data-selected={checked} key={module.code}><input type="checkbox" checked={checked} disabled={module.isBase} onChange={(event) => setSelectedModules((current) => event.target.checked ? [...new Set([...current, module.code])] : current.filter((code) => code !== module.code))} /><span><small>{module.code}{module.isBase ? ' · BASE' : ''}</small><strong>{module.name}</strong><em>{Math.max(1, Number(module.durationWeeks) || 1)} semana(s) · {Math.max(0, Number(module.meetingsPerWeek) || 0)} reunião(ões)/semana</em></span></label>; })}</div>
    <div className={styles.implementationEstimate}><div><small>MÓDULOS</small><strong>{contractedModules.length}</strong></div><div><small>PRAZO</small><strong>{estimatedWeeks} semanas</strong></div><div><small>REUNIÕES</small><strong>{plannedMeetings}</strong></div><div><small>CONCLUSÃO</small><strong>{estimatedEnd ? new Date(estimatedEnd).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—'}</strong></div></div>
    {error ? <p role="alert" className={styles.formError}>{error}</p> : null}
    <div className={styles.formActions}><Link href="/implementacoes">Cancelar</Link><button className={styles.button} type="submit" disabled={saving || !contractedModules.length}>{saving ? 'Criando…' : 'Iniciar implementação'}</button></div>
  </form>;
}

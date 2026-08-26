import Link from 'next/link';
import styles from '../../platform.module.css';
import { viacaoHorizonteUsers } from '../../../_data/demo';

const phaseStatus = [
  { code: 'F01', name: 'Qualificação e logística', answered: 7, total: 7, status: 'Em andamento', progress: 57 },
  { code: 'F02', name: 'Kickoff e diagnóstico', answered: 0, total: 0, status: 'Aguardando', progress: 0 },
  { code: 'F03', name: 'Acessos e governança', answered: 0, total: 0, status: 'Aguardando', progress: 0 },
  { code: 'F04', name: 'Cadastros auxiliares', answered: 0, total: 0, status: 'Aguardando', progress: 0 },
  { code: 'F05', name: 'Cadastro da frota', answered: 0, total: 0, status: 'Aguardando', progress: 0 },
  { code: 'F06', name: 'Abastecimento e posto', answered: 0, total: 0, status: 'Aguardando', progress: 0 },
] as const;

export default function CompanyDetail() {
  return (
    <main className={styles.main}>
      <div className={styles.heading}>
        <div><span>Empresa cliente</span><h1>Viação Horizonte</h1></div>
        <Link href="/empresas" className={styles.backLink}>← Voltar às empresas</Link>
      </div>

      <div className={styles.companySummary}>
        <div><small>CNPJ</small><strong>00.000.000/0001-01</strong></div>
        <div><small>RESPONSÁVEL</small><strong>Marina Proprietária</strong></div>
        <div><small>CONTATO</small><strong>marina@viacaohorizonte.demo</strong></div>
        <div><small>STATUS</small><span className={styles.pill}>Ativa</span></div>
      </div>

      <section className={styles.companyUsersSection}>
        <div className={styles.sectionHeading}><div><h2>Usuários da empresa</h2><p>Estes usuários têm acesso somente à Viação Horizonte. Usuários globais da GD Tech continuam com acesso administrativo.</p></div><span className={styles.answerCounter}>{viacaoHorizonteUsers.length} vinculados</span></div>
        <div className={styles.companyUserGrid}>{viacaoHorizonteUsers.map((user) => <article className={styles.companyUserCard} key={user.email}><span>{user.initials}</span><div><strong>{user.name}</strong><small>{user.email}</small></div><div><b>{user.role}</b><small>Somente Viação Horizonte</small></div></article>)}</div>
      </section>

      <section className={styles.companyProducts}>
        <div className={styles.sectionHeading}>
          <div><h2>Produtos contratados</h2><p>Ao adicionar um produto, suas fases e perguntas são copiadas para esta empresa.</p></div>
          <Link className={styles.button} href="/empresas/viacao-horizonte/produtos/novo">+ Adicionar produto</Link>
        </div>

        <article className={styles.contractedProduct}>
          <div className={styles.productContractHeader}>
            <div><span className={styles.productTag}>Produto ativo</span><h3>GD Frotas</h3><p>Template versão 1 · contratado em 20/08/2026</p></div>
            <div className={styles.contractActions}><Link href="/implementacoes/piloto">Abrir implementação</Link><Link href="/templates">Ver modelo do produto</Link></div>
          </div>

          <div className={styles.linkExplanation}>
            <span>✓</span><p><strong>Estrutura vinculada à implementação.</strong> As respostas abaixo pertencem somente à Viação Horizonte. Alterações futuras no modelo do produto não mudam esta versão contratada.</p>
          </div>

          <div className={styles.companyPhaseList}>
            {phaseStatus.map((phase) => (
              <div className={styles.companyPhase} key={phase.code}>
                <span className={styles.phaseCode}>{phase.code}</span>
                <div><strong>{phase.name}</strong><small>{phase.total ? `${phase.answered} de ${phase.total} perguntas respondidas` : 'Perguntas serão configuradas no produto'}</small></div>
                <div className={styles.phaseProgress}><i><b style={{ width: `${phase.progress}%` }} /></i><span>{phase.progress}%</span></div>
                {phase.code === 'F01' ? (
                  <Link className={styles.phaseState} data-active="true" href="/empresas/viacao-horizonte/produtos/gd-frotas/fases/f01">{phase.status} ›</Link>
                ) : (
                  <span className={styles.phaseState}>{phase.status}</span>
                )}
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

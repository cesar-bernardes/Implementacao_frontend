import Link from 'next/link';
import { companies } from '../../_data/demo';
import styles from '../platform.module.css';

export default function Companies() {
  return (
    <main className={styles.main}>
      <div className={styles.heading}>
        <div><span>Cadastro, produtos contratados e isolamento multiempresa</span><h1>Empresas</h1></div>
        <Link className={styles.button} href="/empresas/nova">+ Cadastrar empresa</Link>
      </div>
      <div className={styles.flowHint}>
        <span>1</span><strong>Cadastre a empresa</strong><i>→</i><span>2</span><strong>Adicione o produto comprado</strong><i>→</i><span>3</span><strong>Acompanhe as respostas na implementação</strong>
      </div>
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead><tr><th>Empresa</th><th>Documento</th><th>Produtos</th><th>Implementações</th><th>Membros</th><th>Status</th><th /></tr></thead>
          <tbody>{companies.map((company, index) => (
            <tr key={company.name}>
              <td><strong>{company.name}</strong></td>
              <td className={styles.muted}>{company.document}</td>
              <td>{index === 0 ? <span className={styles.productTag}>GD Frotas</span> : <span className={styles.muted}>Nenhum</span>}</td>
              <td>{company.implementations}</td><td>{company.members}</td>
              <td><span className={styles.pill}>{company.status}</span></td>
              <td>{index === 0 ? <Link className={styles.rowLink} href="/empresas/viacao-horizonte">Ver empresa ›</Link> : <span className={styles.rowLinkMuted}>Ver empresa ›</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </main>
  );
}

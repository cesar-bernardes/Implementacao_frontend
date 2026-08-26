import Link from 'next/link';
import styles from '../../../../platform.module.css';
import { ProductContractForm } from './product-contract-form';

export default function NewCompanyProductPage() {
  return <main className={`${styles.main} ${styles.narrowMain}`}><div className={styles.heading}><div><span>Viação Horizonte · Etapa 2 de 2</span><h1>Adicionar produto</h1></div><Link href="/empresas/viacao-horizonte" className={styles.backLink}>← Voltar à empresa</Link></div><ProductContractForm /></main>;
}

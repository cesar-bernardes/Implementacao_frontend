import Link from 'next/link';
import styles from '../../platform.module.css';
import { CompanyForm } from './company-form';

export default function NewCompanyPage() {
  return <main className={`${styles.main} ${styles.narrowMain}`}><div className={styles.heading}><div><span>Etapa 1 de 2</span><h1>Cadastrar empresa</h1></div><Link href="/empresas" className={styles.backLink}>← Voltar às empresas</Link></div><CompanyForm /></main>;
}

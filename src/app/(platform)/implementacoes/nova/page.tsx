import Link from 'next/link';
import styles from '../../platform.module.css';
import { NewImplementationForm } from './new-implementation-form';

export default function NewImplementationPage() {
  return <main className={`${styles.main} ${styles.narrowMain}`}>
    <div className={styles.heading}><div><span>Nova operação</span><h1>Iniciar implementação</h1></div><Link href="/implementacoes" className={styles.backLink}>← Voltar às implementações</Link></div>
    <NewImplementationForm />
  </main>;
}

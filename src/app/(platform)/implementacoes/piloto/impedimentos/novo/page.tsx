import Link from 'next/link';
import styles from '../../../../platform.module.css';
import { BlockerForm } from './blocker-form';

export default function NewBlockerPage() {
  return (
    <main className={`${styles.main} ${styles.narrowMain}`}>
      <div className={styles.heading}>
        <div><span>Viação Horizonte · GD Frotas</span><h1>Registrar impedimento</h1></div>
        <Link href="/implementacoes/piloto" className={styles.backLink}>← Voltar ao status</Link>
      </div>
      <BlockerForm />
    </main>
  );
}

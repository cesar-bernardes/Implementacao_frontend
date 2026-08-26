import Link from 'next/link';
import { ImplementationMonitor } from './implementation-monitor';
import styles from '../platform.module.css';
export default function Implementations(){return <main className={styles.main}><div className={styles.heading}><div><span>Projetos em execução</span><h1>Implementações</h1></div><Link className={styles.button} href="/empresas/viacao-horizonte/produtos/novo">+ Iniciar implementação</Link></div><ImplementationMonitor /></main>}

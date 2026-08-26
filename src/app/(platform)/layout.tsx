import Link from 'next/link';
import { Nav } from './nav';
import styles from './platform.module.css';
export default function PlatformLayout({children}:{children:React.ReactNode}){return <div className={styles.shell}><aside className={styles.sidebar}><Link href="/dashboard" className={styles.brand}><b>GD</b> TECH</Link><Nav/><div className={styles.account}><strong>Ana Admin</strong><span>Administrador global</span></div></aside><div className={styles.content}><header className={styles.topbar}><p>Empresa ativa: <strong>GD Tech</strong></p><strong>Ambiente demonstrativo</strong></header>{children}</div></div>}

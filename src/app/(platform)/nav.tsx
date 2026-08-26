'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './platform.module.css';
const links = [['/dashboard','Visão geral'],['/empresas','Empresas'],['/implementacoes','Implementações'],['/calendario','Calendário'],['/templates','Produtos'],['/usuarios','Usuários globais'],['/auditoria','Auditoria']];
export function Nav(){const pathname=usePathname();return <nav className={styles.nav}>{links.map(([href,label])=><Link key={href} href={href} data-active={pathname===href}>{label}</Link>)}</nav>}

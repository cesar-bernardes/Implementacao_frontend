'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './platform.module.css';

const globalLinks = [['/dashboard','Visão geral'],['/empresas','Empresas'],['/implementacoes','Implementações'],['/calendario','Calendário'],['/templates','Produtos'],['/usuarios','Usuários globais'],['/auditoria','Auditoria']];
const companyLinks = [['/dashboard','Visão geral'],['/implementacoes','Implementações'],['/calendario','Calendário']];

export function Nav({ isGlobalAdmin }: { isGlobalAdmin: boolean }) {
  const pathname = usePathname();
  const links = isGlobalAdmin ? globalLinks : companyLinks;
  return <nav className={styles.nav}>{links.map(([href,label]) => <Link key={href} href={href} data-active={pathname === href || pathname.startsWith(`${href}/`)}>{label}</Link>)}</nav>;
}

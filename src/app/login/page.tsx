import { DemoLogin } from './demo-login';
import styles from './login.module.css';
export default function LoginPage() { return <main className={styles.page}><section className={styles.intro}><div className={styles.logo}><b>GD</b> TECH</div><div><span>GD IMPLEMENTA</span><h1>Transforme cada implantação em uma entrega previsível.</h1><p>Organize empresas, responsáveis, evidências, riscos e critérios de aceite em um só lugar.</p></div><small>Ambiente demonstrativo · dados fictícios</small></section><DemoLogin /></main>; }

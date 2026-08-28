import { ProductBuilder } from './product-builder';
import styles from '../platform.module.css';
export default function Products(){return <main className={styles.main}><div className={styles.heading}><div><span>Produtos e metodologia própria</span><h1>GD Frotas</h1></div><button className={styles.button}>+ Criar produto</button></div><ProductBuilder /></main>}

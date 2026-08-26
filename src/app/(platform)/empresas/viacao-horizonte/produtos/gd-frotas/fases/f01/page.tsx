import Link from 'next/link';
import { viacaoHorizonteF01Answers as answers } from '../../../../../../../_data/demo';
import styles from '../../../../../../../(platform)/platform.module.css';

export default function CompanyPhaseF01Page() {
  return (
    <main className={styles.main}>
      <div className={styles.heading}>
        <div><span>Viação Horizonte · GD Frotas</span><h1>F01 · Qualificação e logística</h1></div>
        <Link href="/empresas/viacao-horizonte" className={styles.backLink}>← Voltar à empresa</Link>
      </div>

      <div className={styles.phaseDetailSummary}>
        <div><small>SITUAÇÃO DA FASE</small><strong>Em andamento</strong></div>
        <div><small>RESPOSTAS</small><strong>7 de 7</strong></div>
        <div><small>VALIDAÇÃO</small><strong>3 concluídas · 4 pendentes</strong></div>
        <div><small>PROGRESSO</small><strong>57%</strong></div>
      </div>

      <section className={styles.companyProducts}>
        <div className={styles.sectionHeading}>
          <div><h2>Perguntas e respostas da empresa</h2><p>Estas são as mesmas respostas utilizadas no acompanhamento da implementação.</p></div>
          <Link className={styles.secondaryButton} href="/implementacoes/piloto">Ver na implementação</Link>
        </div>
        <div className={styles.answerList}>
          {answers.map((item) => (
            <article className={styles.answerCard} key={item.code}>
              <div className={styles.answerCode}>{item.code}</div>
              <div className={styles.answerContent}>
                <div className={styles.answerTitle}><strong>{item.question}</strong><span data-tone={item.tone}>{item.status}</span></div>
                <div className={styles.companyAnswerBox}><small>RESPOSTA DA VIAÇÃO HORIZONTE</small><p>{item.answer}</p></div>
                <footer><span>Respondido por {item.owner}</span><span>•</span><span>{item.evidence}</span></footer>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

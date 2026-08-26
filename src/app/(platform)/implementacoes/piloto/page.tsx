'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import styles from '../../platform.module.css';
import { productPhases, viacaoHorizonteCompanyResponses, viacaoHorizonteF01Answers } from '../../../_data/demo';
import { PhaseAnswers } from './phase-answers';

export default function ImplementationStatus() {
  const [companyResponses, setCompanyResponses] = useState<Record<string, string>>(viacaoHorizonteCompanyResponses);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const saved = window.localStorage.getItem('gdtech.companyResponses');
      if (saved) {
        try { setCompanyResponses({ ...viacaoHorizonteCompanyResponses, ...(JSON.parse(saved) as Record<string, string>) }); } catch { /* ignora dados inválidos */ }
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, []);

  const implementation = useMemo(() => {
    const allQuestions = productPhases.flatMap((phase) => phase.questions.map(([code]) => ({ code, phase: phase.code })));
    const completed = allQuestions.filter(({ code, phase }) => (companyResponses[code] ?? viacaoHorizonteCompanyResponses[code] ?? (phase === 'F01' ? viacaoHorizonteF01Answers.find((item) => item.code === code)?.answer : '')) === 'Concluído').length;
    const answeredPhases = productPhases.filter((phase) => phase.questions.some(([code]) => companyResponses[code]));
    const currentPhase = answeredPhases.at(-1) ?? productPhases.find((phase) => phase.code === 'F09') ?? productPhases[0];
    return { completed, total: allQuestions.length, currentPhase, percent: Math.round((completed / allQuestions.length) * 100) };
  }, [companyResponses]);

  return (
    <main className={`${styles.main} ${styles.statusPage}`}>
      <div className={styles.heading}>
        <div><span>Viação Horizonte · GD Frotas</span><h1>Status da implementação</h1></div>
        <Link href="/implementacoes" className={styles.backLink}>← Voltar às implementações</Link>
      </div>

      <div className={styles.statusLayout}>
        <div className={styles.statusMain}>
          <div className={styles.currentStage}>
            <span>STATUS OPERACIONAL</span><strong>Em implementação</strong>
            <p>Fase {implementation.currentPhase.order} · {implementation.currentPhase.name}</p>
            <div className={styles.stageBar}><i style={{ width: `${implementation.percent}%` }} /></div>
            <small>{implementation.percent}% concluído · {implementation.completed} de {implementation.total} perguntas concluídas</small>
          </div>

          <section>
            <div className={styles.sectionHeading}>
              <div><h2>O que impede o avanço</h2><p>Gerado pelas pendências das perguntas ou registrado manualmente.</p></div>
              <Link className={styles.secondaryButton} href="/implementacoes/piloto/impedimentos/novo">+ Registrar impedimento</Link>
            </div>
            <div className={styles.blocker}>
              <b>Bloqueio principal · QL-06</b><strong>Validar acesso aos pontos operacionais</strong>
              <p>O escritório foi liberado, mas o cliente ainda precisa autorizar o acesso ao pátio e ao posto.</p>
              <footer><span>Responsável: Rafael Champion</span><span>Esperando há 2 dias</span></footer>
            </div>
            <div className={styles.attention}>
              <strong>QL-07 · Bases e documentos precisam de evidência</strong>
              <p>A base da frota foi recebida, mas falta anexar o procedimento de controle de KM.</p>
              <small>Responsável: Marina Proprietária · vence amanhã</small>
            </div>
          </section>

          <section>
            <h2>Aprovações pendentes</h2>
            <div className={styles.approval}><span className={styles.avatar}>RC</span><div><strong>Rafael Champion</strong><p>QL-06 · Acesso aos pontos operacionais</p></div><b>Cliente</b></div>
            <div className={styles.approval}><span className={styles.avatar}>CI</span><div><strong>Carlos Implementador</strong><p>QL-01 · Revisar pré-requisitos obrigatórios</p></div><b>GD Tech</b></div>
          </section>

          <section className={styles.answersSection}>
            <div className={styles.sectionHeading}>
              <div><h2>Perguntas e respostas da empresa</h2><p>Selecione uma fase para consultar e responder suas perguntas. Administradores e qualquer membro com acesso à empresa podem participar.</p></div>
              <span className={styles.answerCounter}>10 fases</span>
            </div>
            <PhaseAnswers />
          </section>
        </div>

        <aside className={styles.statusAside}>
          <section><h2>Responsabilidade pela espera</h2><div className={styles.delayGrid}><div><span>Cliente</span><strong>2 dias</strong><small>2 pendências</small></div><div><span>GD Tech</span><strong>6 horas</strong><small>1 revisão</small></div></div></section>
          <section><h2>Próximo passo</h2><div className={styles.nextStep}><span>1</span><div><strong>Aprovar o gate de qualificação</strong><p>Após QL-06 e QL-07, a implementação avança para Diagnóstico presencial.</p></div></div></section>
          <section><h2>Últimos acontecimentos</h2><ol className={styles.timeline}><li><i /><div><strong>QL-04 concluída</strong><span>Carlos Implementador · hoje, 13:42</span></div></li><li><i /><div><strong>Base da frota anexada</strong><span>Marina Proprietária · ontem, 16:42</span></div></li><li><i /><div><strong>Procedimento de KM solicitado</strong><span>Carlos Implementador · ontem, 11:18</span></div></li></ol></section>
        </aside>
      </div>
    </main>
  );
}

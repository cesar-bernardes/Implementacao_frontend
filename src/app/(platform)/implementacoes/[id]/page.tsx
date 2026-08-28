'use client';

import Link from 'next/link';
import { FormEvent, use, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../../../lib/api';
import styles from '../../platform.module.css';

type Question = {
  id: string;
  code: string;
  prompt: string;
  responseType: 'CHECKLIST' | 'NUMBER' | 'SHORT_TEXT';
  required: boolean;
  responseConfig: { trainingUrl?: string } | null;
  checklistValue: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_DONE' | null;
  numberValue: string | null;
  textValue: string | null;
  notes: string | null;
  answeredByName: string | null;
  answeredAt: string | null;
};
type Phase = { id: string; code: string; name: string; sortOrder: number; isBase: boolean; durationWeeks: number; meetingsPerWeek: number; questions: Question[] };
type Implementation = {
  id: string;
  name: string;
  status: string;
  currentPhaseCode: string | null;
  selectedPhaseCodes: string[] | null;
  estimatedWeeks: number;
  plannedMeetings: number;
  startedAt: string | null;
  dueAt: string | null;
  organization: { tradeName: string };
  owner: { name: string } | null;
  templateVersion: { version: number; template: { product: { name: string } } };
  phases: Phase[];
};

const checklistLabels = { COMPLETED: 'Concluído', IN_PROGRESS: 'Em andamento', NOT_DONE: 'Não realizado' } as const;

function isAnswered(question: Question) {
  return Boolean(question.checklistValue || question.numberValue !== null || question.textValue);
}

function isCompleted(question: Question) {
  return question.responseType === 'CHECKLIST' ? question.checklistValue === 'COMPLETED' : isAnswered(question);
}

export default function ImplementationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [implementation, setImplementation] = useState<Implementation | null>(null);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<Implementation>(`/implementations/${id}`)
      .then((data) => {
        setImplementation(data);
        setSelectedPhase(data.currentPhaseCode ?? data.phases[0]?.code ?? '');
      })
      .catch(() => setError('Você não possui acesso a esta implementação ou ela não foi encontrada.'));
  }, [id]);

  const totals = useMemo(() => {
    const questions = implementation?.phases.flatMap((phase) => phase.questions) ?? [];
    const completed = questions.filter(isCompleted).length;
    return { questions: questions.length, completed, percent: questions.length ? Math.round((completed / questions.length) * 100) : 0 };
  }, [implementation]);

  const phasePlanning = useMemo(() => {
    const planning = new Map<string, { period: string; meetings: number }>();
    if (!implementation?.startedAt) return planning;
    let cursor = new Date(implementation.startedAt).getTime();
    for (const phase of implementation.phases) {
      const weeks = Math.max(1, Number(phase.durationWeeks) || 1);
      const end = cursor + weeks * 7 * 86400000;
      const format = (value: number) => new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' });
      planning.set(phase.code, { period: `${format(cursor)} → ${format(end)}`, meetings: weeks * Math.max(0, Number(phase.meetingsPerWeek) || 0) });
      cursor = end;
    }
    return planning;
  }, [implementation]);

  if (error) return <main className={styles.main}><div className={styles.card}><h2>Acesso indisponível</h2><p>{error}</p><Link href="/implementacoes">Voltar</Link></div></main>;
  if (!implementation) return <main className={styles.main}><p>Carregando fases e perguntas…</p></main>;
  const phase = implementation.phases.find((item) => item.code === selectedPhase) ?? implementation.phases[0];
  const currentPhase = implementation.phases.find((item) => item.code === implementation.currentPhaseCode) ?? implementation.phases[0];

  async function saveAnswer(questionId: string, body: Record<string, unknown>) {
    setError('');
    try {
      const updated = await apiRequest<Implementation>(`/implementations/${id}/questions/${questionId}/answer`, { method: 'PATCH', body: JSON.stringify(body) });
      setImplementation(updated);
      setSelectedPhase(updated.currentPhaseCode ?? selectedPhase);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível salvar a resposta.');
    }
  }

  return <main className={styles.main}>
    <div className={styles.heading}><div><span>{implementation.organization.tradeName} · {implementation.templateVersion.template.product.name}</span><h1>{implementation.name}</h1></div><Link href="/implementacoes" className={styles.backLink}>← Voltar às implementações</Link></div>
    <section className={styles.implementationOverview}>
      <div><small>PROGRESSO GERAL</small><strong>{totals.percent}%</strong><span>{totals.completed} de {totals.questions} perguntas concluídas</span></div>
      <div className={styles.implementationProgress}><i style={{ width: `${totals.percent}%` }} /></div>
      <div className={styles.currentPhaseSummary}>
        <small>{totals.percent === 100 ? 'IMPLEMENTAÇÃO CONCLUÍDA' : 'FASE OPERACIONAL ATUAL'}</small>
        <strong>{currentPhase ? `${currentPhase.code} · ${currentPhase.name}` : 'Não definida'}</strong>
        <span>{totals.percent === 100 ? '100% concluída' : 'Em andamento'}</span>
      </div>
      <div><small>RESPONSÁVEL GD TECH</small><strong>{implementation.owner?.name ?? 'Não definido'}</strong><span>Administrador e responsável atribuído podem atualizar.</span></div>
    </section>
    <section className={styles.implementationSchedule}>
      <div><small>PERÍODO PLANEJADO</small><strong>{implementation.startedAt ? new Date(implementation.startedAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'A definir'} → {implementation.dueAt ? new Date(implementation.dueAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'A definir'}</strong></div>
      <div><small>MÓDULOS CONTRATADOS</small><strong>{implementation.phases.length}</strong></div>
      <div><small>DURAÇÃO ESTIMADA</small><strong>{implementation.estimatedWeeks} semanas</strong></div>
      <div><small>REUNIÕES PLANEJADAS</small><strong>{implementation.plannedMeetings}</strong></div>
    </section>
    {totals.percent === 100 ? <section className={styles.completionCelebration} role="status"><span>✓</span><div><strong>Parabéns! Você concluiu 100% do seu check-list.</strong><p>Todas as fases e etapas desta implementação foram finalizadas com sucesso.</p></div></section> : null}
    {error ? <p className={styles.formError} role="alert">{error}</p> : null}
    {!phase ? <section className={styles.card}><h2>Nenhuma fase encontrada</h2><p>Revise a versão do produto vinculada a esta implementação.</p></section> : <section className={styles.implementationWorkspace}>
      <aside className={styles.implementationPhases}>
        <div><small>ETAPAS DA IMPLEMENTAÇÃO</small><h2>Fases</h2></div>
        {implementation.phases.map((item) => {
          const completed = item.questions.filter(isCompleted).length;
          const answered = item.questions.filter(isAnswered).length;
          const isCurrent = item.code === currentPhase?.code;
          const isBeforeCurrent = currentPhase ? item.sortOrder < currentPhase.sortOrder : false;
          const planned = phasePlanning.get(item.code);
          const state = completed === item.questions.length && item.questions.length
              ? 'Concluída'
            : isCurrent
              ? 'Em andamento'
              : answered || isBeforeCurrent
                ? 'Com pendências'
                : 'Aguardando início';
          return <button key={item.id} type="button" data-active={item.code === phase.code} onClick={() => setSelectedPhase(item.code)}><span>{item.code}</span><div><strong>{item.name}</strong><small>{completed}/{item.questions.length} concluídas</small>{planned ? <small className={styles.moduleWindow}>{planned.period} · {planned.meetings} reunião(ões)</small> : null}</div><b data-state={state}>{state}</b></button>;
        })}
      </aside>
      <article className={styles.implementationQuestions}>
        <header><div><small>{phase.code}</small><h2>{phase.name}</h2><p>{phase.questions.length} perguntas nesta fase</p></div></header>
        <div>{phase.questions.map((question) => <QuestionAnswer key={question.id} question={question} onSave={(body) => saveAnswer(question.id, body)} />)}</div>
      </article>
    </section>}
  </main>;
}

function QuestionAnswer({ question, onSave }: { question: Question; onSave: (body: Record<string, unknown>) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [confirmTraining, setConfirmTraining] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const body = question.responseType === 'NUMBER'
      ? { numberValue: Number(form.get('value')) }
      : { textValue: String(form.get('value') ?? '') };
    await onSave(body);
    setSaving(false);
  }

  async function selectChecklist(value: string) {
    setSaving(true);
    await onSave({ checklistValue: value });
    setSaving(false);
  }

  return <section className={styles.liveQuestion}>
    <div className={styles.liveQuestionTitle}><span>{question.code}</span><div><strong>{question.prompt}</strong><div className={styles.questionMeta}><small>{question.required ? 'Obrigatória' : 'Opcional'}</small></div></div>{isCompleted(question) ? <b>Concluído</b> : isAnswered(question) ? <b data-progress>Em andamento</b> : <b data-empty>Não respondida</b>}</div>
    <div className={styles.answerControlRow}>
      {question.responseType === 'CHECKLIST' ? <select aria-label={`Resposta de ${question.code}`} value={question.checklistValue ?? ''} disabled={saving} onChange={(event) => selectChecklist(event.target.value)}><option value="" disabled>Selecione uma situação</option><option value="COMPLETED">Concluído</option><option value="IN_PROGRESS">Em andamento</option><option value="NOT_DONE">Não realizado</option></select> : <form onSubmit={submit}><input name="value" type={question.responseType === 'NUMBER' ? 'number' : 'text'} maxLength={question.responseType === 'SHORT_TEXT' ? 100 : undefined} defaultValue={question.numberValue ?? question.textValue ?? ''} required /><button className={styles.secondaryButton} disabled={saving}>{saving ? 'Salvando…' : 'Salvar resposta'}</button></form>}
      <button className={styles.trainingButton} type="button" data-available={Boolean(question.responseConfig?.trainingUrl)} disabled={!question.responseConfig?.trainingUrl} title={question.responseConfig?.trainingUrl ? 'Abrir treinamento' : 'Cadastre o link na aba Produto'} aria-label={question.responseConfig?.trainingUrl ? `Abrir treinamento de ${question.code}` : `Treinamento ainda não cadastrado para ${question.code}`} onClick={() => setConfirmTraining(true)}><span aria-hidden="true">▶</span><strong>{question.responseConfig?.trainingUrl ? 'Treinamento' : 'Sem link'}</strong></button>
    </div>
    {question.answeredByName ? <footer>Atualizado por {question.answeredByName}{question.checklistValue ? ` · ${checklistLabels[question.checklistValue]}` : ''}</footer> : null}
    {confirmTraining && question.responseConfig?.trainingUrl ? <div className={styles.trainingDialogBackdrop} role="presentation"><div className={styles.trainingDialog} role="dialog" aria-modal="true" aria-labelledby={`training-title-${question.id}`}><button className={styles.trainingDialogClose} type="button" aria-label="Fechar" onClick={() => setConfirmTraining(false)}>×</button><span className={styles.trainingDialogIcon} aria-hidden="true">▶</span><h3 id={`training-title-${question.id}`}>Abrir link de treinamento?</h3><p>Isso é um link de treinamento. Deseja realmente abrir?</p><div><button type="button" className={styles.editorCancel} onClick={() => setConfirmTraining(false)}>Cancelar</button><a className={styles.button} href={question.responseConfig.trainingUrl} target="_blank" rel="noopener noreferrer" onClick={() => setConfirmTraining(false)}>Abrir treinamento</a></div></div></div> : null}
  </section>;
}

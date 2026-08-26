'use client';

import { useEffect, useRef, useState } from 'react';
import { productPhases, viacaoHorizonteCompanyResponses, viacaoHorizonteF01Answers } from '../../../_data/demo';
import styles from '../../platform.module.css';

export function PhaseAnswers() {
  const [phases, setPhases] = useState(productPhases);
  const [openPhase, setOpenPhase] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [localResponses, setLocalResponses] = useState<Record<string, string>>(viacaoHorizonteCompanyResponses);
  const loadedResponses = useRef(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('gdtech.productPhases');
    const timer = window.setTimeout(() => {
      if (saved) {
        try { setPhases(JSON.parse(saved) as typeof productPhases); } catch { /* mantém os dados de demonstração */ }
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem('gdtech.companyResponses');
    const timer = window.setTimeout(() => {
      if (saved) {
        try { setLocalResponses({ ...viacaoHorizonteCompanyResponses, ...(JSON.parse(saved) as Record<string, string>) }); } catch { /* mantém as respostas de demonstração */ }
      }
      loadedResponses.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loadedResponses.current) window.localStorage.setItem('gdtech.companyResponses', JSON.stringify(localResponses));
  }, [localResponses]);

  return (
    <div className={styles.phaseAnswerList}>
      {phases.map((phase) => {
        const isOpen = openPhase === phase.code;
        const answered = phase.questions.filter(([code]) => {
          const savedResponse = phase.code === 'F01' ? viacaoHorizonteF01Answers.find((item) => item.code === code)?.answer : '';
          return Boolean(localResponses[code] ?? savedResponse);
        }).length;
        const pending = phase.questions.length - answered;
        const phaseState = answered === phase.questions.length ? 'complete' : answered > 0 ? 'progress' : 'waiting';

        return (
          <article className={styles.phaseAnswerCard} data-open={isOpen} key={phase.code}>
            <button className={styles.phaseAnswerToggle} type="button" aria-expanded={isOpen} onClick={() => setOpenPhase(isOpen ? null : phase.code)}>
              <span className={styles.phaseAnswerCode}>{phase.code}</span>
              <span className={styles.phaseAnswerName}><strong>{phase.name}</strong><small>{phase.questions.length} perguntas · {answered} respondidas</small></span>
              <span className={styles.phaseAnswerSummary} data-state={phaseState}>{answered === phase.questions.length ? 'Concluída' : answered > 0 ? `${pending} pendentes` : 'Aguardando início'}</span>
              <span className={styles.phaseChevron}>{isOpen ? '−' : '+'}</span>
            </button>

            {isOpen ? (
              <div className={styles.phaseAnswerBody}>
                {phase.questions.map(([code, question, type]) => {
                  // Configurações antigas (ex.: Ação / checklist) seguem o padrão atual do produto.
                  const rawType = type as string;
                  const responseType: string = rawType === 'Número' || rawType === 'Texto curto' ? rawType : 'Caixa de seleção';
                  const response = viacaoHorizonteF01Answers.find((item) => item.code === code);
                  const answerText = localResponses[code] ?? response?.answer ?? '';
                  const isEditing = editingCode === code;
                  return (
                    <div className={styles.compactAnswer} key={code}>
                      <div className={styles.answerCode}>{code}</div>
                      <div className={styles.answerContent}>
                        <div className={styles.answerTitle}>
                          <strong>{question}</strong>
                          <span data-tone={localResponses[code] ? 'review' : response?.tone ?? 'waiting'}>{localResponses[code] ? 'Rascunho atualizado' : response?.status ?? 'Não respondida'}</span>
                        </div>
                        {responseType === 'Caixa de seleção' ? (
                          <div className={styles.companyAnswerBox}>
                            <div className={styles.responseBoxHeader}><small>RESPOSTA DA VIAÇÃO HORIZONTE</small></div>
                            <select className={styles.responseSelect} data-value={answerText} value={answerText} onChange={(event) => setLocalResponses({ ...localResponses, [code]: event.target.value })}>
                              <option value="">Selecione uma situação</option>
                              <option value="Concluído">Concluído</option>
                              <option value="Em andamento">Em andamento</option>
                              <option value="Não realizado">Não realizado</option>
                            </select>
                          </div>
                        ) : isEditing ? (
                          <div className={styles.responseEditor}>
                            {responseType === 'Número' ? (
                              <input type="number" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Informe um número" autoFocus />
                            ) : (
                              <input type="text" maxLength={100} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Digite uma resposta (até 100 caracteres)" autoFocus />
                            )}
                            <div><button type="button" className={styles.answerAction} onClick={() => { setLocalResponses({ ...localResponses, [code]: draft }); setEditingCode(null); }}>Salvar resposta</button><button type="button" className={styles.answerCancel} onClick={() => setEditingCode(null)}>Cancelar</button></div>
                          </div>
                        ) : (
                          <div className={styles.companyAnswerBox}>
                            <div className={styles.responseBoxHeader}><small>RESPOSTA DA VIAÇÃO HORIZONTE</small><button type="button" className={styles.responsePrimary} onClick={() => { setDraft(answerText); setEditingCode(code); }}>{answerText ? 'Editar resposta' : 'Responder'}</button></div>
                            <p>{answerText || 'A empresa ainda não respondeu esta pergunta.'}</p>
                          </div>
                        )}
                        <footer>{response ? <><span>Respondido por {response.owner}</span><span>•</span><span>{response.evidence}</span></> : <span>Disponível para membros com acesso e administradores.</span>}</footer>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

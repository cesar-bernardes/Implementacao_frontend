export const companies = [
  { name: 'Viação Horizonte', document: '00.000.000/0001-01', implementations: 1, members: 4, status: 'Ativa' },
  { name: 'Logística Pantanal', document: '00.000.000/0002-84', implementations: 0, members: 0, status: 'Preparação' },
];
export const globalUsers = [
  { name: 'Ana Admin', email: 'admin@gdtech.demo', role: 'Administradora global', scope: 'Todas as empresas' },
  { name: 'Lucas Gestor', email: 'gestor@gdtech.demo', role: 'Global restrito', scope: 'Empresas autorizadas pela GD Tech' },
] as const;
export const viacaoHorizonteUsers = [
  { name: 'Marina Proprietária', email: 'diretoria@horizonte.demo', role: 'Dono', initials: 'MP' },
  { name: 'Rafael Champion', email: 'operacao@horizonte.demo', role: 'Supervisor', initials: 'RC' },
  { name: 'Carlos Implementador', email: 'consultor@gdtech.demo', role: 'Responsável', initials: 'CI' },
] as const;
export const phases = [
  ['Qualificação', 82], ['Kickoff e diagnóstico', 60], ['Acessos e governança', 40],
  ['Cadastros auxiliares', 20], ['Cadastro da frota', 8], ['Abastecimento e posto', 0],
  ['Registro e check-in', 0], ['Checklist', 0], ['Dashboards e relatórios', 0],
  ['Treinamentos', 0], ['Piloto acompanhado', 0], ['Go-live e handoff', 0],
] as const;
const productPhasesDefinition = [
  { code: 'F01', name: 'Qualificação e logística', order: 1, questions: [
    ['QL-01', 'Validar todos os pré-requisitos obrigatórios', 'Ação / checklist', true],
    ['QL-02', 'Definir escopo, unidades e frota', 'Ação / checklist', true],
    ['QL-03', 'Nomear champion e responsáveis locais', 'Ação / checklist', true],
    ['QL-04', 'Definir agenda da visita', 'Ação / checklist', true],
    ['QL-05', 'Preparar sala e recursos de treinamento', 'Ação / checklist', true],
    ['QL-06', 'Validar acesso aos pontos operacionais', 'Ação / checklist', true],
    ['QL-07', 'Receber bases e documentos antes da visita', 'Ação / checklist', true],
  ]},
  { code: 'F02', name: 'Diagnóstico presencial', order: 2, questions: [
    ['DP-01', 'Realizar kickoff no local', 'Ação / checklist', true],
    ['DP-02', 'Acompanhar o fluxo físico dos veículos', 'Ação / checklist', true],
    ['DP-03', 'Acompanhar o processo de abastecimento', 'Ação / checklist', true],
    ['DP-04', 'Acompanhar checklist e manutenção', 'Ação / checklist', true],
    ['DP-05', 'Testar conectividade nos pontos de uso', 'Ação / checklist', true],
    ['DP-06', 'Definir frota e turno piloto', 'Ação / checklist', true],
  ]},
  { code: 'F03', name: 'Acessos e governança', order: 3, questions: [
    ['AG-01', 'Validar acesso administrador', 'Ação / checklist', true],
    ['AG-02', 'Cadastrar usuários presencialmente', 'Ação / checklist', true],
    ['AG-03', 'Definir permissões e papéis', 'Ação / checklist', true],
    ['AG-04', 'Testar dispositivos da operação', 'Ação / checklist', true],
  ]},
  { code: 'F04', name: 'Cadastros auxiliares', order: 4, questions: [
    ['CA-01', 'Cadastrar centros de custo', 'Ação / checklist', true],
    ['CA-02', 'Cadastrar tipos de veículo e categorias', 'Ação / checklist', true],
    ['CA-03', 'Revisar combustíveis', 'Ação / checklist', true],
    ['CA-04', 'Configurar regra geral de abastecimento', 'Ação / checklist', true],
  ]},
  { code: 'F05', name: 'Cadastro da frota', order: 5, questions: [
    ['CF-01', 'Higienizar a base com a equipe local', 'Ação / checklist', true],
    ['CF-02', 'Cadastrar ou importar a frota', 'Ação / checklist', true],
    ['CF-03', 'Conferir veículos fisicamente por amostragem', 'Ação / checklist', true],
    ['CF-04', 'Vincular centros de custo, combustíveis e proprietários', 'Ação / checklist', true],
    ['CF-05', 'Atualizar status ativos e inativos', 'Ação / checklist', true],
  ]},
  { code: 'F06', name: 'Dashboards e relatórios', order: 6, questions: [
    ['DR-01', 'Validar Dashboard de Abastecimento', 'Ação / checklist', true],
    ['DR-02', 'Validar Dashboard de Checklist', 'Ação / checklist', true],
    ['DR-03', 'Testar filtros, colunas e CSV', 'Ação / checklist', true],
  ]},
  { code: 'F07', name: 'Treinamentos presenciais', order: 7, questions: [
    ['TP-01', 'Treinar administradores e gestores', 'Ação / checklist', true],
    ['TP-02', 'Treinar abastecimento e check-in por turno', 'Ação / checklist', true],
    ['TP-03', 'Treinar motoristas no veículo', 'Ação / checklist', true],
    ['TP-04', 'Treinar manutenção', 'Ação / checklist', true],
  ]},
  { code: 'F08', name: 'Abastecimento e posto', order: 8, questions: [
    ['AP-01', 'Definir metas de consumo', 'Ação / checklist', true],
    ['AP-02', 'Testar ajuste em Registro', 'Ação / checklist', true],
    ['AP-03', 'Testar ajuste de saldo em Gestão', 'Ação / checklist', true],
    ['AP-04', 'Conferir histórico e exportação', 'Ação / checklist', true],
  ]},
  { code: 'F09', name: 'Registro e check-in', order: 9, questions: [
    ['RC-01', 'Definir posição e responsável pelo check-in', 'Ação / checklist', true],
    ['RC-02', 'Executar check-in com veículo real', 'Ação / checklist', true],
    ['RC-03', 'Testar correção de KM e fotos', 'Ação / checklist', true],
    ['RC-04', 'Validar exclusão e cascata de pendências', 'Ação / checklist', true],
    ['RC-05', 'Testar Tarefas do Sistema', 'Ação / checklist', true],
  ]},
  { code: 'F10', name: 'Checklist', order: 10, questions: [
    ['CK-01', 'Construir catálogo de itens com a operação', 'Ação / checklist', true],
    ['CK-02', 'Montar checklists por segmento', 'Ação / checklist', true],
    ['CK-03', 'Configurar regras gerais', 'Ação / checklist', true],
    ['CK-04', 'Cadastrar gestores de notificação', 'Ação / checklist', true],
    ['CK-05', 'Executar checklist com motorista real', 'Ação / checklist', true],
    ['CK-06', 'Validar Operação e Alertas', 'Ação / checklist', true],
    ['CK-07', 'Gerar e tratar Ordem de Serviço', 'Ação / checklist', true],
  ]},
] as const;

// No GD Frotas, todas as perguntas usam a caixa de seleção de andamento.
export const productPhases = productPhasesDefinition.map((phase) => ({
  ...phase,
  questions: phase.questions.map(([code, question, , required]) => [code, question, 'Caixa de seleção', required] as const),
}));

// Cenário inicial da demonstração: todas as perguntas até F09 já foram concluídas.
export const viacaoHorizonteCompanyResponses: Record<string, string> = Object.fromEntries(
  productPhases.filter((phase) => phase.order <= 9).flatMap((phase) => phase.questions.map(([code]) => [code, 'Concluído'])),
);

export const viacaoHorizonteF01Answers = [
  { code: 'QL-01', question: 'Validar todos os pré-requisitos obrigatórios', answer: 'Em andamento', owner: 'Carlos Implementador', evidence: 'Checklist de qualificação', status: 'Em revisão', tone: 'review' },
  { code: 'QL-02', question: 'Definir escopo, unidades e frota', answer: 'Concluído', owner: 'Rafael Champion', evidence: 'Escopo confirmado', status: 'Concluída', tone: 'approved' },
  { code: 'QL-03', question: 'Nomear champion e responsáveis locais', answer: 'Concluído', owner: 'Marina Proprietária', evidence: 'Contatos confirmados', status: 'Concluída', tone: 'approved' },
  { code: 'QL-04', question: 'Definir agenda da visita', answer: 'Concluído', owner: 'Carlos Implementador', evidence: 'Agenda confirmada', status: 'Concluída', tone: 'approved' },
  { code: 'QL-05', question: 'Preparar sala e recursos de treinamento', answer: 'Em andamento', owner: 'Rafael Champion', evidence: 'Confirmação parcial', status: 'Em revisão', tone: 'review' },
  { code: 'QL-06', question: 'Validar acesso aos pontos operacionais', answer: 'Não realizado', owner: 'Rafael Champion', evidence: 'Liberação incompleta', status: 'Bloqueando avanço', tone: 'blocked' },
  { code: 'QL-07', question: 'Receber bases e documentos antes da visita', answer: 'Em andamento', owner: 'Marina Proprietária', evidence: 'Falta procedimento de KM', status: 'Falta evidência', tone: 'attention' },
] as const;

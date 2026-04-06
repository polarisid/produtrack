import { GoogleGenerativeAI } from '@google/generative-ai';
import { Task, InboxItem, Habit, Project } from '@/store/useGTDStore';

// Initialize the API
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

export type ClarifyResult = {
  type: 'Task' | 'Project' | 'Idea' | 'Reference' | 'Someday';
  nextAction: string;
  context: string;
  priority: 'low' | 'medium' | 'high';
};

export async function clarifyInboxItem(text: string): Promise<ClarifyResult> {
  const prompt = `Você é um assistente de produtividade especialista no método GTD (Getting Things Done).
O usuário capturou o seguinte item na sua Caixa de Entrada: "${text}"

Por favor, analise a entrada e retorne APENAS um JSON válido seguindo a estrutura abaixo, sem marcação markdown e sem textos adicionais.
{
  "type": "Task" ou "Project" ou "Idea" ou "Reference" ou "Someday",
  "nextAction": "A primeira ação física e objetiva que pode ser feita para avançar este item (MUITO claro e acionável). Se for Idea, Reference ou Someday, deixe vazio ou explique",
  "context": "Contexto sugerido (ex: @trabalho, @casa, @computador, @telefone, @rua, @financeiro)",
  "priority": "low" ou "medium" ou "high"
}`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(responseText) as ClarifyResult;
}

export async function breakdownTask(title: string, description?: string): Promise<string[]> {
  const prompt = `Você é um assistente de produtividade GTD especialista em quebrar paralisia de tarefas.
O usuário quer destrinchar esta tarefa grande em pequenos passos simples, executáveis em 10-20 min.
Tarefa: "${title}"
${description ? `Detalhes: "${description}"` : ''}

Retorne APENAS um array JSON de strings com os títulos das menores subtarefas que levam a conclusão, sem marcação markdown e sem texto adicional:
[
  "Subtarefa 1",
  "Subtarefa 2"
]
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(responseText) as string[];
}

export type UnblockResult = {
  nextSimpleStep: string;
  timeEstimate: string;
  energyLevel: 'Baixa' | 'Média' | 'Alta';
  advice: string;
};

export async function unblockTask(title: string, description?: string): Promise<UnblockResult> {
  const prompt = `O usuário está paralisado e não consegue iniciar a seugione tarefa.
Tarefa: "${title}"
${description ? `Detalhes: "${description}"` : ''}

Retorne APENAS um JSON para destravar o usuário, usando o menor movimento viável possível:
{
  "nextSimpleStep": "A primeiríssima ação de 5 minutos, ex: 'Abrir o word e escrever a primeira frase'",
  "timeEstimate": "Tempo estimado para esse pequeno passo",
  "energyLevel": "Baixa, Média, ou Alta",
  "advice": "Uma frase encorajadora direta ao ponto sugerindo como lidar com essa resistência ou renegociar a tarefa."
}
No Markdown. Return only raw JSON.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(responseText) as UnblockResult;
}

export type DailyFocusResult = {
  summary: string;
  topPriorities: string[];
  quickWins: string[];
  deepWork: string[];
  alert?: string;
};

export async function generateDailyFocus(tasks: Task[], habits: Habit[]): Promise<DailyFocusResult> {
  const pendingTasks = tasks.filter(t => t.status !== 'done').map(t => ({ title: t.title, priority: t.priority }));
  
  const prompt = `Você é um mentor de execução implacável e claro. Hoje é dia de focar.
Aqui estão as tarefas pendentes do usuário: ${JSON.stringify(pendingTasks)}

Por favor, gere uma orientação de foco do dia no formato JSON abaixo.
Seja direto, escolha itens factíveis se houver muitos, e não deixe a carga pesada assustar o usuário.
{
  "summary": "Um parágrafo forte e inspirador indicando qual deve ser a grande postura/foco central do dia.",
  "topPriorities": ["Tarefa 1", "Tarefa 2"], // Escolha no máximo 3 críticas (de preferência as de prioridade alta)
  "quickWins": ["Tarefa rápida 1"], // Escolha itens que geram tração imediata
  "deepWork": ["Tarefa profunda 1"], // Tarefas que exigem mergulho
  "alert": "Algum alerta importante. Ex: 'Você tem mais de 10 tarefas paradas na alta prioridade, cuidado com a sobrecarga.'"
}
No Markdown. Only JSON.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(responseText);
  return {
    ...parsed,
    // Garanta que não deixamos undefined
    topPriorities: parsed.topPriorities || [],
    quickWins: parsed.quickWins || [],
    deepWork: parsed.deepWork || []
  };
}

export async function generateSmartAlerts(tasks: Task[], inbox: InboxItem[]): Promise<string[]> {
  const prompt = `Examine o estado do sistema deste usuário:
- Inbox items: ${inbox.length}
- Tarefas de Alta prioridade pendentes: ${tasks.filter(t => t.priority === 'high' && t.status !== 'done').length}
- Total de tarefas pendentes: ${tasks.filter(t => t.status !== 'done').length}

Gere APENAS um array de strings (JSON) contendo de 0 a 3 alertas inteligentes, curtos, contextuais e não invasivos.
Exemplos de regras mentais: se inbox > 5, avise sobre clareza. Se muita alta prioridade, avise sobre foco e realinhamento.
[
  "Sua inbox está acumulando (${inbox.length} itens). Processe para esvaziar a mente."
]
No Markdown. Only JSON.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(responseText) as string[];
}

export type WeeklyInsightsResult = {
  summary: string;
  delayedTasks: string[];
  bottlenecks: string[];
  actionableInsights: string[];
  nextWeekFocus: string;
};

export async function generateWeeklyInsights(tasks: Task[]): Promise<WeeklyInsightsResult> {
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  
  const prompt = `Analise a situação de final de semana deste usuário:
- Tarefas concluídas: ${completedTasks}
- Tarefas estagnadas/pedentes: ${JSON.stringify(pendingTasks.map(t => ({ title: t.title, priority: t.priority })))}

Como um assistente de GTD, julgue o desempenho da semana e direcione a próxima semana.
Gere um JSON válido SEM MARCAÇÃO MARKDOWN com a seguinte estrutura:
{
  "summary": "Um resumo geral acolhedor do desempenho da semana",
  "delayedTasks": ["Tarefa importante x atrasada", "Tarefa z parada a muito tempo"],
  "bottlenecks": ["Se há risco de sobrecarga, ou projetos mal formatados, mencione aqui"],
  "actionableInsights": ["Faça Y para destrancar Z", "Limite suas prioridades diárias para X"],
  "nextWeekFocus": "A sugestão do foco mestre da próxima semana, em 1 frase"
}
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(responseText) as WeeklyInsightsResult;
}

export async function processBrainDump(text: string): Promise<string[]> {
  const prompt = `Você é uma ferramenta de produtividade "Smart Brain Dump" baseada em GTD.
O usuário despejou um raciocínio longo, confuso ou não formatado que contem várias tarefas, pendências ou ideias misturadas.

Texto do Despejo:
"""
${text}
"""

Sua tarefa é separar e extrair cada intenção viável de ação ou ideia como um item independente. Não perca contexto, reescreva se necessário para ser inteligível por si só.
Retorne APENAS um JSON array de strings (sem formatação markdown). Por exemplo:
["Comprar pão na padaria amanhã", "Enviar e-mail para o Roberto sobre o relatório de vendas", "Cancelar assinatura da Netflix"]
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(responseText) as string[];
}

export type SmartHabitSuggestion = {
  name: string;
  target: number;
  color: string;
  reason: string;
};

export async function suggestSmartHabits(tasks: Task[], habits: Habit[]): Promise<SmartHabitSuggestion[]> {
  const pendingTasks = tasks.map(t => ({ title: t.title, context: t.context }));
  const currentHabits = habits.map(h => h.name);

  const prompt = `Você é um mentor especialista em rotinas e "Smart Hábitos" (Hábitos Inteligentes).
O usuário deseja recomendações de novos hábitos para melhorar sua vida, produtividade e resolução de problemas, COM BASE nas suas tarefas pendentes reais.

Contexto do usuário:
- Hábitos atuais construídos: ${JSON.stringify(currentHabits)}
- Tarefas e pendências ativas: ${JSON.stringify(pendingTasks)}

Leia as tarefas dele como um psicólogo/estrategista. Tem muitas tarefas médicas? Sugira Água/Exercício. Tem muito trabalho/bugs? Sugira Revisão/Foco/Desconexão. Tem tarefas financeiras? Sugira Revisão de Gastos.
Selecione até 3 hábitos extremamente cirúrgicos e acionáveis.
Não sugira hábitos que ele já possui.

Retorne APENAS um JSON (array) sem formatação markdown. Cores aceitas: "blue", "orange", "green", "red", "purple".
Exemplo de Estrutura esperada:
[
  {
    "name": "Limpeza Matinal 10 min",
    "target": 21,
    "color": "green",
    "reason": "Notei várias tarefas sobre organizar a casa. 10 minutos por dia mantém o ambiente são sem pesar sua rotina."
  }
]`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(responseText) as SmartHabitSuggestion[];
}

export async function generateProactiveReminder(tasks: Task[], timeOfDay: 'morning' | 'afternoon' | 'evening'): Promise<string> {
  const pendingTasks = tasks.map(t => ({ title: t.title, priority: t.priority }));
  
  const prompt = `Você é um Assistente Proativo de Produtividade GTD (Copiloto) que vive no celular/computador do usuário. 
Sua função agora é mandar UMA PUSH NOTIFICATION extremamente curta e direta.
Lembre-se: Push notifications de celular tem espaço limitadíssimo, então vá direto ao ponto! 

Contexto:
- Período do dia agora: ${timeOfDay}
- Tarefas pendentes relevantes: ${JSON.stringify(pendingTasks.slice(0, 5))}

Aja de forma amigável, como um mentor. Diga algo como "Foco total na tarefa X antes de escurecer!" ou "Você já liquidou suas prioridades hoje? Vamos resolver a tarefa Y!".
Tamanho máximo absoluto: 80 caracteres. SEM hashtag. SEM aspas duplas em volta da resposta. APENAS a string limpa absoluta.`;

  const result = await model.generateContent(prompt);
  return result.response.text().replace(/"/g, '').trim();
}

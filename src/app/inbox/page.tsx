"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrainCircuit, ListPlus, Send, ArrowRightCircle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { useGTDStore } from "@/store/useGTDStore";

const GTD_TRIGGERS = [
  {
    title: "🧾 1. Materiais de trabalho",
    items: ["Listas de tarefas atuais", "Projetos em andamento", "Projetos pendentes", "Projetos futuros", "Materiais de apoio", "Relatórios", "Pendências com clientes", "Pendências com fornecedores"]
  },
  {
    title: "🏢 2. Comunicação",
    items: ["E-mails não respondidos", "Mensagens (WhatsApp, Slack etc.)", "Ligações não retornadas", "Conversas pendentes", "Follow-ups esquecidos"]
  },
  {
    title: "📊 3. Responsabilidades profissionais",
    items: ["Subordinados / equipe", "Supervisores", "Parceiros", "Clientes", "Processos internos"]
  },
  {
    title: "💰 4. Financeiro",
    items: ["Contas a pagar", "Contas a receber", "Impostos", "Investimentos", "Orçamento pessoal / empresa"]
  },
  {
    title: "🏠 5. Casa / vida pessoal",
    items: ["Manutenção da casa", "Compras", "Organização", "Família", "Compromissos pessoais"]
  },
  {
    title: "❤️ 6. Saúde",
    items: ["Consultas médicas", "Exames", "Exercícios", "Alimentação", "Descanso"]
  },
  {
    title: "🧠 7. Desenvolvimento pessoal",
    items: ["Cursos", "Livros", "Habilidades a aprender", "Metas pessoais"]
  },
  {
    title: "📦 8. Coisas para comprar",
    items: ["Eletrônicos", "Roupas", "Equipamentos", "Ferramentas"]
  },
  {
    title: "✈️ 9. Viagens / eventos",
    items: ["Planejamento", "Reservas", "Documentos", "Preparação"]
  },
  {
    title: "⚙️ 10. Projetos gerais",
    items: ["Algo que leva mais de 1 passo", "Ideias não iniciadas", "Melhorias"]
  },
  {
    title: "⚠️ 11. Problemas / preocupações",
    items: ["Algo não resolvido", "Riscos", "Coisas que estão te incomodando"]
  },
  {
    title: "💡 12. Ideias criativas",
    items: ["Negócios", "Conteúdo", "Invenções", "Melhorias"]
  },
  {
    title: "📚 13. Referências",
    items: ["Informações úteis", "Links", "Anotações", "Documentos"]
  },
  {
    title: "🗂️ 14. Algum dia / talvez",
    items: ["Coisas que você quer fazer", "Ideias futuras", "Sonhos"]
  }
];

export default function InboxPage() {
  const { inbox, addInboxItem, openProcessModal } = useGTDStore();
  const [newItem, setNewItem] = React.useState("");
  const [showTriggers, setShowTriggers] = React.useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    addInboxItem(newItem.trim());
    setNewItem("");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-primary" />
          Inbox
        </h1>
        <p className="text-muted-foreground">
          Esvazie sua mente. Capture tudo que precisa da sua atenção agora e processe depois.
        </p>
      </div>

      {/* Quick Capture Input */}
      <form onSubmit={handleAdd} className="flex gap-3 bg-card p-2 rounded-2xl border shadow-sm">
        <div className="flex-1 flex items-center px-3 gap-3">
          <ListPlus className="h-5 w-5 text-muted-foreground" />
          <Input 
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="O que está na sua cabeça?" 
            className="border-none shadow-none focus-visible:ring-0 text-base px-0"
          />
        </div>
        <Button type="submit" size="icon" className="rounded-xl h-12 w-12 shrink-0 border-r-0">
          <Send className="h-5 w-5" />
        </Button>
      </form>

      {/* Triggers Section */}
      <div className="flex flex-col items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowTriggers(!showTriggers)} 
          className="text-muted-foreground text-xs h-8 hover:text-foreground"
        >
          <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
          Não sabe o que por aqui? Clique aqui
          {showTriggers ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
        </Button>
        
        {showTriggers && (
          <div className="mt-4 w-full animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GTD_TRIGGERS.map((category) => (
                <div key={category.title} className="bg-card border rounded-xl p-4 shadow-sm">
                  <h4 className="font-semibold text-sm mb-2">{category.title}</h4>
                  <ul className="space-y-1">
                    {category.items.map((item) => (
                      <li key={item} className="text-xs text-muted-foreground list-disc list-inside">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Inbox Items List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-muted-foreground uppercase tracking-wider">{inbox.length} itens não processados</span>
        </div>

        {inbox.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 border border-dashed rounded-2xl">
            <BrainCircuit className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">Sua mente está limpa</h3>
            <p className="text-sm text-muted-foreground mt-1">Nada na caixa de entrada por enquanto.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {inbox.map((item) => (
              <Card key={item.id} className="border shadow-sm group hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <span className="font-medium text-sm lg:text-base">{item.title}</span>
                  <Button 
                    onClick={() => openProcessModal(item)}
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary hover:bg-primary/10 transition-colors opacity-100 lg:opacity-0 group-hover:opacity-100"
                  >
                    Processar
                    <ArrowRightCircle className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

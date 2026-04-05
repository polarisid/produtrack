"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrainCircuit, ListPlus, Send, ArrowRightCircle } from "lucide-react";
import { useGTDStore } from "@/store/useGTDStore";

export default function InboxPage() {
  const { inbox, addInboxItem, openProcessModal } = useGTDStore();
  const [newItem, setNewItem] = React.useState("");

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

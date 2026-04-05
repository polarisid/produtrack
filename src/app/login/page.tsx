"use client";

import * as React from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { CheckSquare, Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type AuthMode = "login" | "signup" | "reset";

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/invalid-email": "E-mail inválido.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/user-not-found": "Nenhuma conta encontrada com este e-mail.",
  "auth/wrong-password": "Senha incorreta.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/email-already-in-use": "Este e-mail já está em uso.",
  "auth/weak-password": "A senha precisa ter ao menos 6 caracteres.",
  "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
  "auth/network-request-failed": "Erro de conexão. Verifique sua internet.",
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = React.useState<AuthMode>("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/");
      } else if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
        router.push("/");
      } else if (mode === "reset") {
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      }
    } catch (err: any) {
      const code = err?.code ?? "";
      setError(FIREBASE_ERRORS[code] || "Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError("");
    setSuccessMsg("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-background flex">
      
      {/* Left Panel - Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 via-primary to-primary/70 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-4 border-white/40" />
          <div className="absolute bottom-32 right-16 w-48 h-48 rounded-full border-2 border-white/20" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white/10" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
              <CheckSquare className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">ProduTrack</span>
          </div>
          <p className="text-primary-foreground/70 text-sm font-medium">Central de Produtividade GTD</p>
        </div>

        <div className="relative z-10 space-y-6">
          {[
            { title: "Capture tudo", desc: "Liberte a sua mente capturando ideias e tarefas instantaneamente." },
            { title: "Organize com clareza", desc: "Processe e priorize com contextos, projetos e prazos." },
            { title: "Execute com foco", desc: "Saiba sempre qual é a sua próxima ação mais importante." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="mt-1 h-2 w-2 rounded-full bg-white/60 shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">{item.title}</p>
                <p className="text-white/60 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="relative z-10">
          <p className="text-white/40 text-xs">
            © 2025 ProduTrack · Método GTD em prática
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        
        {/* Theme toggle */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        {/* Mobile logo */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="bg-primary rounded-lg p-1.5">
            <CheckSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">ProduTrack</span>
        </div>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-1">
              {mode === "login" && "Bem-vindo de volta"}
              {mode === "signup" && "Criar nova conta"}
              {mode === "reset" && "Recuperar senha"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === "login" && "Entre na sua central de produtividade."}
              {mode === "signup" && "Configure a sua conta em segundos."}
              {mode === "reset" && "Enviaremos um link para o seu e-mail."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  autoFocus
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            {mode !== "reset" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "signup" ? "Mínimo 6 caracteres" : "Sua senha"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11"
                    required
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password Link */}
            {mode === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchMode("reset")}
                  className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 py-2.5 px-3 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200">
                {error}
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 py-2.5 px-3 rounded-lg animate-in fade-in duration-200">
                {successMsg}
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-11 font-medium gap-2" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "login" && "Entrar"}
                  {mode === "signup" && "Criar Conta"}
                  {mode === "reset" && "Enviar E-mail"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Mode Switch */}
          {mode === "login" && (
            <p className="text-center text-sm text-muted-foreground">
              Não tem conta?{" "}
              <button onClick={() => switchMode("signup")} className="text-primary font-medium hover:underline underline-offset-4">
                Criar agora
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{" "}
              <button onClick={() => switchMode("login")} className="text-primary font-medium hover:underline underline-offset-4">
                Fazer login
              </button>
            </p>
          )}
          {mode === "reset" && (
            <p className="text-center text-sm text-muted-foreground">
              Lembrou a senha?{" "}
              <button onClick={() => switchMode("login")} className="text-primary font-medium hover:underline underline-offset-4">
                Fazer login
              </button>
            </p>
          )}

        </div>
      </div>
    </div>
  );
}

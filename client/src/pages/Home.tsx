import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileText, Users, ClipboardCheck, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user } = useAuth();
  const { data: fichas, isLoading: loadingFichas } = trpc.fichas.list.useQuery();

  const getRoleLabel = (role?: string) => {
    const roleLabels: Record<string, string> = {
      aluno: "Aluno",
      instrutor: "Instrutor",
      coordenador: "Coordenador",
      gerente: "Gerente",
      administrador: "Administrador",
    };
    return roleLabels[role || ""] || role;
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  // Estatísticas básicas
  const totalFichas = fichas?.length || 0;
  const fichasFinalizadas = fichas?.filter(f => f.status === "finalizada" || f.status === "aprovada").length || 0;
  const fichasRascunho = fichas?.filter(f => f.status === "rascunho").length || 0;
  const fichasReprovadas = fichas?.filter(f => f.status === "reprovada").length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section com Logo DECEA */}
        <div className="flex items-center gap-6">
          <img src="/decea-logo.jpg" alt="DECEA" className="h-20 w-20 rounded-lg shadow-md" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              {getWelcomeMessage()}, {user?.name}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Você está logado como <span className="font-medium text-primary">{getRoleLabel(user?.role)}</span>
              {user?.orgaoAtc && ` no ${user.orgaoAtc}`}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Fichas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingFichas ? "..." : totalFichas}</div>
              <p className="text-xs text-muted-foreground">
                {user?.role === "aluno" ? "Suas avaliações" : "No sistema"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Finalizadas</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingFichas ? "..." : fichasFinalizadas}</div>
              <p className="text-xs text-muted-foreground">
                Aprovadas ou concluídas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Rascunho</CardTitle>
              <FileText className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingFichas ? "..." : fichasRascunho}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando finalização
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reprovadas</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingFichas ? "..." : fichasReprovadas}</div>
              <p className="text-xs text-muted-foreground">
                Necessitam revisão
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesse as funcionalidades principais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/fichas">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Minhas Fichas
                </Button>
              </Link>
              
              {(user?.role === "instrutor" || user?.role === "coordenador" || 
                user?.role === "gerente" || user?.role === "administrador") && (
                <Link href="/fichas/nova">
                  <Button variant="outline" className="w-full justify-start">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Criar Nova Ficha
                  </Button>
                </Link>
              )}

              {(user?.role === "coordenador" || user?.role === "gerente" || 
                user?.role === "administrador") && (
                <Link href="/relatorios">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Ver Relatórios
                  </Button>
                </Link>
              )}

              {(user?.role === "gerente" || user?.role === "administrador") && (
                <Link href="/usuarios">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Gerenciar Usuários
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sobre o Sistema</CardTitle>
              <CardDescription>
                Sistema de Gerenciamento de Fichas de Avaliação ATCO
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Este sistema foi desenvolvido para gerenciar fichas de avaliação prática de 
                Controladores de Tráfego Aéreo, baseado no <strong>Anexo C da CIRCEA 100-51</strong>.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                O sistema permite criar, editar, visualizar e gerenciar fichas de avaliação, 
                com controle de acesso baseado em cinco níveis: aluno, instrutor, coordenador, 
                gerente e administrador.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {fichas && fichas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fichas Recentes</CardTitle>
              <CardDescription>
                Últimas fichas de avaliação acessíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fichas.slice(0, 5).map((ficha) => (
                  <div key={ficha.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{ficha.avaliadoNome}</p>
                      <p className="text-sm text-muted-foreground">
                        Avaliador: {ficha.avaliadorNome} • {ficha.orgaoAtc}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        ficha.status === "aprovada" ? "bg-green-100 text-green-800" :
                        ficha.status === "finalizada" ? "bg-blue-100 text-blue-800" :
                        ficha.status === "reprovada" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {ficha.status}
                      </span>
                      <Link href={`/fichas/${ficha.id}`}>
                        <Button variant="ghost" size="sm">Ver</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

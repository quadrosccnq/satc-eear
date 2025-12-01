import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Edit, FileText, Clock, User, MapPin, Calendar } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function FichaDetalhes() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/fichas/:id");
  const fichaId = params?.id ? parseInt(params.id) : 0;

  const { data: ficha, isLoading } = trpc.fichas.getById.useQuery({ id: fichaId });
  const { data: itens } = trpc.fichas.getItens.useQuery({ fichaId });
  const { data: historico } = trpc.fichas.getHistorico.useQuery({ fichaId });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Carregando ficha...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!ficha) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Ficha não encontrada</h3>
          <Button className="mt-4" onClick={() => setLocation("/fichas")}>
            Voltar para Fichas
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      rascunho: { variant: "outline", label: "Rascunho" },
      finalizada: { variant: "default", label: "Finalizada" },
      aprovada: { variant: "secondary", label: "Aprovada" },
      reprovada: { variant: "destructive", label: "Reprovada" },
    };
    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getConceitoColor = (conceito?: string) => {
    const colors: Record<string, string> = {
      O: "text-green-600 font-semibold",
      B: "text-blue-600 font-semibold",
      R: "text-yellow-600 font-semibold",
      NS: "text-red-600 font-semibold",
      NA: "text-gray-400",
    };
    return colors[conceito || ""] || "";
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canEdit = 
    user?.role === "administrador" ||
    user?.role === "gerente" ||
    user?.role === "coordenador" ||
    (user?.role === "instrutor" && ficha.avaliadorId === user.id);

  // Agrupar itens por área
  const itensPorArea = itens?.reduce((acc, item) => {
    if (!acc[item.area]) {
      acc[item.area] = {
        nome: item.areaNome,
        itens: [],
      };
    }
    acc[item.area].itens.push(item);
    return acc;
  }, {} as Record<string, { nome: string; itens: typeof itens }>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/fichas")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Ficha de Avaliação #{ficha.id}
              </h1>
              <p className="text-muted-foreground mt-2">
                {ficha.avaliadoNome} - {ficha.orgaoAtc}
              </p>
            </div>
          </div>
          {canEdit && ficha.status === "rascunho" && (
            <Button onClick={() => setLocation(`/fichas/${fichaId}/editar`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </div>

        {/* Status and Basic Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informações Gerais</CardTitle>
              {getStatusBadge(ficha.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Avaliado</p>
                  <p className="text-sm text-muted-foreground">{ficha.avaliadoNome}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Avaliador</p>
                  <p className="text-sm text-muted-foreground">{ficha.avaliadorNome}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Órgão ATC</p>
                  <p className="text-sm text-muted-foreground">{ficha.orgaoAtc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Local</p>
                  <p className="text-sm text-muted-foreground">{ficha.localAvaliacao}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Data</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(ficha.dataAvaliacao)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Finalidade</p>
                  <Badge variant="outline">{ficha.finalidade}</Badge>
                </div>
              </div>
            </div>

            {ficha.licenca && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Licença</p>
                  <p className="text-sm text-muted-foreground">{ficha.licenca}</p>
                </div>
              </>
            )}

            {ficha.condicoesCenario && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Condições do Cenário</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {ficha.condicoesCenario}
                  </p>
                </div>
              </>
            )}

            {((ficha.tempoPosicaoControle || 0) > 0 || (ficha.tempoPosicaoAssistente || 0) > 0) && (
              <>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Tempo Posição Controle</p>
                      <p className="text-sm text-muted-foreground">
                        {ficha.tempoPosicaoControle} minutos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Tempo Posição Assistente</p>
                      <p className="text-sm text-muted-foreground">
                        {ficha.tempoPosicaoAssistente} minutos
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {ficha.rendimento && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Rendimento</p>
                  <p className="text-sm text-muted-foreground">{ficha.rendimento}</p>
                </div>
              </>
            )}

            {ficha.comentarios && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Comentários</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {ficha.comentarios}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Itens de Avaliação */}
        {itens && itens.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Itens de Avaliação</CardTitle>
              <CardDescription>
                Avaliação detalhada por área (Anexo C - CIRCEA 100-51)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(itensPorArea || {}).map(([area, data]) => (
                  <div key={area}>
                    <h3 className="font-semibold mb-3">
                      {area} - {data.nome}
                    </h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="w-24">Conceito</TableHead>
                            <TableHead>Observações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.itens.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.subitem}</TableCell>
                              <TableCell>
                                <span className={getConceitoColor(item.conceito || undefined)}>
                                  {item.conceito || "-"}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {item.observacoes || "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Legenda dos Conceitos</h4>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5 text-sm">
                  <div>
                    <span className="text-green-600 font-semibold">O</span> - Ótimo
                  </div>
                  <div>
                    <span className="text-blue-600 font-semibold">B</span> - Bom
                  </div>
                  <div>
                    <span className="text-yellow-600 font-semibold">R</span> - Regular
                  </div>
                  <div>
                    <span className="text-red-600 font-semibold">NS</span> - Não
                    Satisfatório
                  </div>
                  <div>
                    <span className="text-gray-400">NA</span> - Não Avaliado
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Itens de Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum item de avaliação foi adicionado ainda
              </p>
            </CardContent>
          </Card>
        )}

        {/* Histórico */}
        {historico && historico.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alterações</CardTitle>
              <CardDescription>
                Registro de todas as modificações realizadas nesta ficha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {historico.map((h) => (
                  <div key={h.id} className="flex items-start gap-3 text-sm">
                    <div className="rounded-full bg-muted p-1.5">
                      <FileText className="h-3 w-3" />
                    </div>
                    <div className="flex-1">
                      <p>
                        <span className="font-medium">{h.usuarioNome}</span>{" "}
                        <span className="text-muted-foreground">{h.acao}</span>
                      </p>
                      {h.descricao && (
                        <p className="text-muted-foreground text-xs">{h.descricao}</p>
                      )}
                      <p className="text-muted-foreground text-xs">
                        {formatDateTime(h.dataHora)}
                      </p>
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

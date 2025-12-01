import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { FileText, Plus, Search, Eye, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function Fichas() {
  const { user } = useAuth();
  const { data: fichas, isLoading, refetch } = trpc.fichas.list.useQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [fichaToDelete, setFichaToDelete] = useState<number | null>(null);
  
  const deleteMutation = trpc.fichas.delete.useMutation({
    onSuccess: () => {
      toast.success("Ficha excluída com sucesso!");
      refetch();
      setFichaToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir ficha");
    },
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const canDelete = user?.role === "coordenador" || user?.role === "gerente" || user?.role === "administrador";

  const filteredFichas = fichas?.filter((ficha) => {
    const search = searchTerm.toLowerCase();
    return (
      ficha.avaliadoNome.toLowerCase().includes(search) ||
      ficha.avaliadorNome.toLowerCase().includes(search) ||
      ficha.orgaoAtc.toLowerCase().includes(search) ||
      ficha.status.toLowerCase().includes(search)
    );
  });

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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fichas de Avaliação</h1>
            <p className="text-muted-foreground mt-2">
              {user?.role === "aluno" 
                ? "Suas fichas de avaliação" 
                : "Gerenciar fichas de avaliação do sistema"}
            </p>
          </div>
          {(user?.role === "instrutor" || user?.role === "coordenador" || 
            user?.role === "gerente" || user?.role === "administrador") && (
            <Link href="/fichas/nova">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Ficha
              </Button>
            </Link>
          )}
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Fichas</CardTitle>
            <CardDescription>
              Pesquise por nome do avaliado, avaliador, órgão ou status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Digite para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Fichas</CardTitle>
            <CardDescription>
              {isLoading ? "Carregando..." : `${filteredFichas?.length || 0} fichas encontradas`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Carregando fichas...</div>
              </div>
            ) : filteredFichas && filteredFichas.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Avaliado</TableHead>
                      <TableHead>Avaliador</TableHead>
                      <TableHead>Órgão ATC</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Finalidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFichas.map((ficha) => (
                      <TableRow key={ficha.id}>
                        <TableCell className="font-medium">{ficha.avaliadoNome}</TableCell>
                        <TableCell>{ficha.avaliadorNome}</TableCell>
                        <TableCell>{ficha.orgaoAtc}</TableCell>
                        <TableCell>{formatDate(ficha.dataAvaliacao)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ficha.finalidade}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(ficha.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/fichas/${ficha.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Ver
                              </Button>
                            </Link>
                            {canDelete && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setFichaToDelete(ficha.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Nenhuma ficha encontrada</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchTerm 
                    ? "Tente ajustar os termos de busca" 
                    : "Não há fichas de avaliação cadastradas ainda"}
                </p>
                {(user?.role === "instrutor" || user?.role === "coordenador" || 
                  user?.role === "gerente" || user?.role === "administrador") && (
                  <Link href="/fichas/nova">
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeira Ficha
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={fichaToDelete !== null} onOpenChange={(open) => !open && setFichaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta ficha de avaliação? Esta ação não pode ser desfeita.
              Todos os itens de avaliação e histórico relacionados também serão excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fichaToDelete && handleDelete(fichaToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

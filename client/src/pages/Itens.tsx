import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Plus, Upload, Trash2, Edit2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";

export default function Itens() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({
    anexoC: "",
    oi: "",
    referencia: "",
  });

  // Queries
  const { data: itens, isLoading, refetch } = trpc.itens.list.useQuery({
    anexoC: searchTerm || undefined,
  });

  const { data: categorias } = trpc.itens.getCategorias.useQuery();

  // Mutations
  const createMutation = trpc.itens.create.useMutation({
    onSuccess: () => {
      toast.success("Item criado com sucesso!");
      setFormData({ anexoC: "", oi: "", referencia: "" });
      setIsCreating(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.itens.delete.useMutation({
    onSuccess: () => {
      toast.success("Item deletado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const importMutation = trpc.itens.importBatch.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} itens importados com sucesso!`);
      setIsImporting(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro na importação: ${error.message}`);
    },
  });

  const handleCreateItem = async () => {
    if (!formData.anexoC || !formData.oi) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    createMutation.mutate({
      anexoC: formData.anexoC,
      oi: formData.oi,
      referencia: formData.referencia || undefined,
    });
  };

  const handleImportFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    
    // Verificar se é CSV
    if (fileName.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const items: Array<{ anexoC: string; oi: string; referencia?: string }> = [];
        
        // Pular cabeçalho e processar linhas
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
          
          if (columns.length >= 2) {
            items.push({
              anexoC: columns[0],
              oi: columns[1],
              referencia: columns[2] || undefined,
            });
          }
        }
        
        if (items.length === 0) {
          toast.error("Nenhum item válido encontrado no arquivo");
          return;
        }
        
        importMutation.mutate({ items });
      };
      reader.readAsText(file);
    } else {
      toast.error("Apenas arquivos CSV são suportados no momento");
    }
    
    // Limpar input
    e.target.value = '';
  };

  const handleDeleteItem = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este item?")) {
      deleteMutation.mutate(id);
    }
  };

  // Verificar permissão
  const canManage = ["gerente", "administrador"].includes(user?.role || "");

  if (!canManage) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Acesso Negado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-800">
                Você não tem permissão para acessar esta página. Apenas gerentes e administradores podem gerenciar itens de avaliação.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Itens</h1>
            <p className="text-muted-foreground mt-2">
              Crie e importe itens de avaliação para as fichas
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3">
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Item</DialogTitle>
                <DialogDescription>
                  Adicione um novo item de avaliação ao sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="anexoC">Categoria (Anexo C) *</Label>
                  <Input
                    id="anexoC"
                    placeholder="Ex: AVALIAÇÃO COMPORTAMENTAL"
                    value={formData.anexoC}
                    onChange={(e) => setFormData({ ...formData, anexoC: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="oi">Descrição do Item *</Label>
                  <Input
                    id="oi"
                    placeholder="Ex: Interesse"
                    value={formData.oi}
                    onChange={(e) => setFormData({ ...formData, oi: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="referencia">Referência</Label>
                  <Input
                    id="referencia"
                    placeholder="Ex: ATM-002"
                    value={formData.referencia}
                    onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleCreateItem}
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? "Criando..." : "Criar Item"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isImporting} onOpenChange={setIsImporting}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Importar Arquivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Itens</DialogTitle>
                <DialogDescription>
                  Importe itens de um arquivo Excel ou CSV
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Selecione o arquivo</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportFromFile}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  O arquivo deve conter as colunas: Categoria, Descrição, Referência
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Busca */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Itens */}
        <Card>
          <CardHeader>
            <CardTitle>Itens de Avaliação</CardTitle>
            <CardDescription>
              {itens?.length || 0} itens cadastrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando itens...
              </div>
            ) : itens && itens.length > 0 ? (
              <div className="space-y-2">
                {itens.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.oi}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.anexoC}
                        {item.referencia && ` • ${item.referencia}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum item encontrado. Crie um novo item para começar.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

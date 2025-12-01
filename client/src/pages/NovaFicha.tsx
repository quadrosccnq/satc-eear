import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

export default function NovaFicha() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: usuarios } = trpc.users.list.useQuery();

  const [formData, setFormData] = useState({
    avaliadoId: 0,
    avaliadoNome: "",
    orgaoAtc: user?.orgaoAtc || "",
    localAvaliacao: "",
    dataAvaliacao: new Date().toISOString().split("T")[0],
    finalidade: "Estágio" as "Final" | "Estágio",
    licenca: "",
    condicoesCenario: "",
    copiarItensPadrao: true,
  });

  const createFichaMutation = trpc.fichas.create.useMutation({
    onSuccess: (data) => {
      utils.fichas.list.invalidate();
      toast.success("Ficha criada com sucesso!");
      setLocation(`/fichas/${data.fichaId}`);
    },
    onError: (error) => {
      toast.error(`Erro ao criar ficha: ${error.message}`);
    },
  });

  const handleAvaliadoChange = (userId: string) => {
    const selectedUser = usuarios?.find((u) => u.id === parseInt(userId));
    if (selectedUser) {
      setFormData({
        ...formData,
        avaliadoId: selectedUser.id,
        avaliadoNome: selectedUser.name || "",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.avaliadoId) {
      toast.error("Selecione o avaliado");
      return;
    }

    if (!formData.orgaoAtc || !formData.localAvaliacao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createFichaMutation.mutate({
      ...formData,
      dataAvaliacao: new Date(formData.dataAvaliacao),
      copiarItensPadrao: formData.copiarItensPadrao,
    });
  };

  // Filtrar apenas alunos e instrutores para serem avaliados
  const avaliaveis = usuarios?.filter(
    (u) => u.role === "aluno" || u.role === "instrutor"
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/fichas")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nova Ficha de Avaliação</h1>
            <p className="text-muted-foreground mt-2">
              Criar uma nova ficha de avaliação prática de ATCO
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Dados da Avaliação</CardTitle>
              <CardDescription>
                Preencha as informações básicas da ficha de avaliação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avaliado */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="avaliado">Avaliado *</Label>
                  <Select
                    value={formData.avaliadoId.toString()}
                    onValueChange={handleAvaliadoChange}
                  >
                    <SelectTrigger id="avaliado">
                      <SelectValue placeholder="Selecione o avaliado" />
                    </SelectTrigger>
                    <SelectContent>
                      {avaliaveis?.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} - {user.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="finalidade">Finalidade *</Label>
                  <Select
                    value={formData.finalidade}
                    onValueChange={(value: "Final" | "Estágio") =>
                      setFormData({ ...formData, finalidade: value })
                    }
                  >
                    <SelectTrigger id="finalidade">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Estágio">Estágio</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Órgão e Local */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orgaoAtc">Órgão ATC *</Label>
                  <Input
                    id="orgaoAtc"
                    value={formData.orgaoAtc}
                    onChange={(e) =>
                      setFormData({ ...formData, orgaoAtc: e.target.value })
                    }
                    placeholder="Ex: ACC-BS, APP-SP"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="localAvaliacao">Local da Avaliação *</Label>
                  <Input
                    id="localAvaliacao"
                    value={formData.localAvaliacao}
                    onChange={(e) =>
                      setFormData({ ...formData, localAvaliacao: e.target.value })
                    }
                    placeholder="Ex: Sala de Controle, Simulador"
                    required
                  />
                </div>
              </div>

              {/* Data e Licença */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dataAvaliacao">Data da Avaliação *</Label>
                  <Input
                    id="dataAvaliacao"
                    type="date"
                    value={formData.dataAvaliacao}
                    onChange={(e) =>
                      setFormData({ ...formData, dataAvaliacao: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenca">Licença</Label>
                  <Input
                    id="licenca"
                    value={formData.licenca}
                    onChange={(e) =>
                      setFormData({ ...formData, licenca: e.target.value })
                    }
                    placeholder="Número da licença (opcional)"
                  />
                </div>
              </div>

              {/* Condições do Cenário */}
              <div className="space-y-2">
                <Label htmlFor="condicoesCenario">Condições do Cenário</Label>
                <Textarea
                  id="condicoesCenario"
                  value={formData.condicoesCenario}
                  onChange={(e) =>
                    setFormData({ ...formData, condicoesCenario: e.target.value })
                  }
                  placeholder="Descreva as condições meteorológicas, volume de tráfego, falhas de equipamento, etc."
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Registre informações relevantes sobre o cenário da avaliação
                  (meteorologia adversa, falha de radar, alto volume de tráfego, etc.)
                </p>
              </div>

              {/* Copiar Itens Padrão */}
              <div className="flex items-center space-x-2 rounded-lg border bg-muted/50 p-4">
                <Checkbox
                  id="copiarItensPadrao"
                  checked={formData.copiarItensPadrao}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, copiarItensPadrao: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="copiarItensPadrao"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Adicionar itens de avaliação padrão automaticamente
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Os itens cadastrados na base de dados serão automaticamente adicionados à ficha
                  </p>
                </div>
              </div>

              {/* Avaliador */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="font-medium mb-2">Avaliador</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Nome:</strong> {user?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Função:</strong>{" "}
                  {user?.role === "instrutor"
                    ? "Instrutor"
                    : user?.role === "coordenador"
                    ? "Coordenador"
                    : user?.role === "gerente"
                    ? "Gerente"
                    : "Administrador"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/fichas")}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createFichaMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {createFichaMutation.isPending ? "Criando..." : "Criar Ficha"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Após criar a ficha, você poderá adicionar os itens de avaliação baseados
              nas 11 áreas principais do Anexo C da CIRCEA 100-51:
            </p>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>A - Legislação de Tráfego Aéreo</li>
              <li>B - Domínio Espacial e Uso dos Meios</li>
              <li>C - Organização</li>
              <li>D - Coordenação</li>
              <li>E - Comunicação Oral</li>
              <li>F - Informações ATS</li>
              <li>G - Planejamento</li>
              <li>H - Controle do Tráfego</li>
              <li>I - Emergência e Degradação</li>
              <li>J - Vigilância ATS</li>
              <li>K - Avaliação Comportamental</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

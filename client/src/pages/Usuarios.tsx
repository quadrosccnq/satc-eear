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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Trash2, Users as UsersIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Usuarios() {
  const utils = trpc.useUtils();
  const { data: usuarios, isLoading } = trpc.users.list.useQuery();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "aluno" as "aluno" | "instrutor" | "coordenador" | "gerente" | "administrador",
    unidade: "",
    orgaoAtc: "",
  });

  const createUserMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("Usuário criado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao criar usuário: ${error.message}`);
    },
  });

  const updateUserMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
      toast.success("Usuário atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar usuário: ${error.message}`);
    },
  });

  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success("Usuário excluído com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir usuário: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "aluno",
      unidade: "",
      orgaoAtc: "",
    });
  };

  const handleCreate = () => {
    if (!formData.name) {
      toast.error("Nome é obrigatório");
      return;
    }
    createUserMutation.mutate(formData);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role,
      unidade: user.unidade || "",
      orgaoAtc: user.orgaoAtc || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedUser) return;
    if (!formData.name) {
      toast.error("Nome é obrigatório");
      return;
    }
    updateUserMutation.mutate({
      id: selectedUser.id,
      ...formData,
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o usuário "${name}"?`)) {
      deleteUserMutation.mutate({ id });
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      aluno: { variant: "outline", label: "Aluno" },
      instrutor: { variant: "default", label: "Instrutor" },
      coordenador: { variant: "secondary", label: "Coordenador" },
      gerente: { variant: "default", label: "Gerente" },
      administrador: { variant: "destructive", label: "Administrador" },
    };
    const config = variants[role] || { variant: "outline", label: role };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
            <p className="text-muted-foreground mt-2">
              Criar, editar e remover usuários do sistema
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo usuário
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Nível de Acesso *</Label>
                  <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aluno">Aluno</SelectItem>
                      <SelectItem value="instrutor">Instrutor</SelectItem>
                      <SelectItem value="coordenador">Coordenador</SelectItem>
                      <SelectItem value="gerente">Gerente</SelectItem>
                      <SelectItem value="administrador">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="unidade">Unidade</Label>
                  <Input
                    id="unidade"
                    value={formData.unidade}
                    onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                    placeholder="Ex: CINDACTA I"
                  />
                </div>
                <div>
                  <Label htmlFor="orgaoAtc">Órgão ATC</Label>
                  <Input
                    id="orgaoAtc"
                    value={formData.orgaoAtc}
                    onChange={(e) => setFormData({ ...formData, orgaoAtc: e.target.value })}
                    placeholder="Ex: ACC-BS"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Criando..." : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>
              {isLoading ? "Carregando..." : `${usuarios?.length || 0} usuários cadastrados`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Carregando usuários...</div>
              </div>
            ) : usuarios && usuarios.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Nível de Acesso</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Órgão ATC</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || "-"}</TableCell>
                        <TableCell>{user.email || "-"}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{user.unidade || "-"}</TableCell>
                        <TableCell>{user.orgaoAtc || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(user.id, user.name || "usuário")}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Nenhum usuário encontrado</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Clique em "Novo Usuário" para adicionar o primeiro usuário
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Atualize os dados do usuário
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Nível de Acesso *</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aluno">Aluno</SelectItem>
                    <SelectItem value="instrutor">Instrutor</SelectItem>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-unidade">Unidade</Label>
                <Input
                  id="edit-unidade"
                  value={formData.unidade}
                  onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                  placeholder="Ex: CINDACTA I"
                />
              </div>
              <div>
                <Label htmlFor="edit-orgaoAtc">Órgão ATC</Label>
                <Input
                  id="edit-orgaoAtc"
                  value={formData.orgaoAtc}
                  onChange={(e) => setFormData({ ...formData, orgaoAtc: e.target.value })}
                  placeholder="Ex: ACC-BS"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

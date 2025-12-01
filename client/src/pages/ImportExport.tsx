import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Download, Upload, FileText, AlertCircle } from "lucide-react";

export default function ImportExport() {
  const { user } = useAuth();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportCSVMutation = trpc.export.fichasCSV.useQuery(
    { filtro: 'todas' },
    { enabled: false }
  );

  const exportPDFMutation = trpc.export.fichasPDF.useQuery(
    { filtro: 'todas' },
    { enabled: false }
  );

  const importCSVMutation = trpc.export.importCSV.useMutation();

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const result = await exportCSVMutation.refetch();
      if (result.data?.csv) {
        const element = document.createElement('a');
        const file = new Blob([result.data.csv], { type: 'text/csv' });
        element.href = URL.createObjectURL(file);
        element.download = result.data.filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success(`${result.data.count} ficha(s) exportada(s) em CSV`);
      }
    } catch (error) {
      toast.error('Erro ao exportar CSV');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const result = await exportPDFMutation.refetch();
      if (result.data?.success) {
        toast.success(result.data.message);
        // Aqui seria gerado o PDF real, por enquanto apenas notificamos
      }
    } catch (error) {
      toast.error('Erro ao exportar PDF');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      toast.error('Selecione um arquivo CSV');
      return;
    }

    setIsImporting(true);
    try {
      const csvContent = await csvFile.text();
      const result = await importCSVMutation.mutateAsync({ csvContent });
      
      toast.success(result.message);
      if (result.errors && result.errors.length > 0) {
        toast.error(`${result.errorCount} erro(s) encontrado(s)`);
      }
      
      setCsvFile(null);
    } catch (error) {
      toast.error('Erro ao importar CSV');
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const isGerente = ['gerente', 'administrador'].includes(user?.role || '');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Importação e Exportação
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas fichas de avaliação em formato CSV ou PDF
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Exportar Dados</TabsTrigger>
            {isGerente && <TabsTrigger value="import">Importar Dados</TabsTrigger>}
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Export CSV */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Exportar em CSV
                  </CardTitle>
                  <CardDescription>
                    Baixe as fichas em formato CSV para edição em planilhas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Formato: Tabela com todas as informações das fichas
                  </p>
                  <Button
                    onClick={handleExportCSV}
                    disabled={isExporting}
                    className="w-full"
                    variant="default"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? 'Exportando...' : 'Exportar CSV'}
                  </Button>
                </CardContent>
              </Card>

              {/* Export PDF */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Exportar em PDF
                  </CardTitle>
                  <CardDescription>
                    Baixe as fichas em formato PDF para impressão
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Formato: Documento formatado e pronto para impressão
                  </p>
                  <Button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="w-full"
                    variant="default"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? 'Exportando...' : 'Exportar PDF'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Export Info */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                As fichas exportadas incluem todas as informações: avaliado, avaliador, órgão ATC, data, finalidade e status.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Import Tab */}
          {isGerente && (
            <TabsContent value="import" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Importar Fichas em CSV
                  </CardTitle>
                  <CardDescription>
                    Carregue um arquivo CSV para importar múltiplas fichas de uma vez
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Format Info */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold mb-2">Formato esperado do CSV:</p>
                      <code className="text-xs bg-muted p-2 rounded block">
                        ID,Avaliado,Avaliador,Órgão ATC,Data,Finalidade,Status
                      </code>
                      <p className="text-xs mt-2">
                        Exemplo: 2,"João Silva","Test User","ACC-BS","01/12/2025","Estágio","rascunho"
                      </p>
                    </AlertDescription>
                  </Alert>

                  {/* File Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Selecione o arquivo CSV</label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-muted-foreground
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary file:text-white
                        hover:file:bg-primary/90"
                    />
                    {csvFile && (
                      <p className="text-sm text-green-600">
                        ✓ Arquivo selecionado: {csvFile.name}
                      </p>
                    )}
                  </div>

                  {/* Import Button */}
                  <Button
                    onClick={handleImportCSV}
                    disabled={!csvFile || isImporting}
                    className="w-full"
                    variant="default"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isImporting ? 'Importando...' : 'Importar CSV'}
                  </Button>
                </CardContent>
              </Card>

              {/* Import Info */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  As fichas importadas serão criadas com status "rascunho" e poderão ser editadas posteriormente.
                </AlertDescription>
              </Alert>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

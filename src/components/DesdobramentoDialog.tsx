import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Split, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DesdobramentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  valorOriginal: number;
  dataVencimentoInicial: string;
  onConfirm: (parcelas: {
    numero_parcela: number;
    valor: number;
    data_vencimento: string;
  }[]) => void;
}

const DesdobramentoDialog = ({
  open,
  onOpenChange,
  valorOriginal,
  dataVencimentoInicial,
  onConfirm,
}: DesdobramentoDialogProps) => {
  const [numeroParcelas, setNumeroParcelas] = useState("2");
  const [intervaloMeses, setIntervaloMeses] = useState("1");
  const [loading, setLoading] = useState(false);

  const calcularParcelas = () => {
    const numParcelas = parseInt(numeroParcelas);
    const intervalo = parseInt(intervaloMeses);

    if (!numParcelas || numParcelas < 2 || numParcelas > 60) {
      return [];
    }

    if (!intervalo || intervalo < 1) {
      return [];
    }

    // Cada parcela mantém o valor original completo
    const valorPorParcela = valorOriginal;
    const parcelas = [];

    for (let i = 0; i < numParcelas; i++) {
      const dataBase = new Date(dataVencimentoInicial);
      dataBase.setMonth(dataBase.getMonth() + (i * intervalo));

      parcelas.push({
        numero_parcela: i + 1,
        valor: valorPorParcela,
        data_vencimento: dataBase.toISOString().split('T')[0],
      });
    }

    return parcelas;
  };

  const parcelas = calcularParcelas();

  const handleConfirm = () => {
    if (parcelas.length > 0) {
      setLoading(true);
      onConfirm(parcelas);
      setLoading(false);
      onOpenChange(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Split className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Desdobrar Título</DialogTitle>
              <DialogDescription className="mt-1">
                Crie múltiplas parcelas com o valor original completo em cada uma
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do Título Original */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold text-blue-700">{formatCurrency(valorOriginal)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Vencimento Original</p>
                  <p className="text-lg font-semibold">{formatDate(dataVencimentoInicial)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuração do Desdobramento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_parcelas" className="flex items-center gap-2">
                <Split className="h-4 w-4 text-purple-500" />
                Número de Parcelas *
              </Label>
              <Input
                id="numero_parcelas"
                type="number"
                min="2"
                max="60"
                value={numeroParcelas}
                onChange={(e) => setNumeroParcelas(e.target.value)}
                placeholder="Ex: 3"
                className="border-2"
              />
              <p className="text-xs text-muted-foreground">Mínimo: 2 | Máximo: 60</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="intervalo_meses" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                Intervalo (meses) *
              </Label>
              <Input
                id="intervalo_meses"
                type="number"
                min="1"
                max="12"
                value={intervaloMeses}
                onChange={(e) => setIntervaloMeses(e.target.value)}
                placeholder="Ex: 1"
                className="border-2"
              />
              <p className="text-xs text-muted-foreground">Meses entre parcelas</p>
            </div>
          </div>

          {/* Preview das Parcelas */}
          {parcelas.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-lg">Preview das Parcelas</h3>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {parcelas.map((parcela) => (
                  <Card key={parcela.numero_parcela} className="border-l-4 border-l-green-500">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                            {parcela.numero_parcela}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-muted-foreground">
                              Parcela {parcela.numero_parcela}/{parcelas.length}
                            </p>
                            <p className="text-lg font-bold text-green-700">
                              {formatCurrency(parcela.valor)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Vencimento</p>
                          <p className="font-semibold">{formatDate(parcela.data_vencimento)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Resumo */}
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total de Parcelas:</span>
                    <span className="text-xl font-bold text-purple-700">{parcelas.length}x</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-semibold">Valor por Parcela:</span>
                    <span className="text-xl font-bold text-green-700">
                      {formatCurrency(parcelas[0]?.valor || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t">
                    <span className="font-semibold text-lg">Valor Total:</span>
                    <span className="text-2xl font-bold text-blue-700">
                      {formatCurrency((parcelas[0]?.valor || 0) * parcelas.length)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm text-yellow-700">
                    Configure o número de parcelas e o intervalo para ver o preview
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading || parcelas.length === 0}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Desdobrando...
              </>
            ) : (
              <>
                <Split className="mr-2 h-4 w-4" />
                Confirmar Desdobramento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DesdobramentoDialog;




import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

type EyeValues = {
  spherical?: string;
  cylindrical?: string;
  axis?: string;
  av?: string;
};

export interface PrescriptionData {
  distanceOD?: EyeValues;
  distanceOE?: EyeValues;
  addition?: string;
  lensType?: string;
  returnDate?: string;
  observations?: string;
  recommendations?: string;
}

interface PrescriptionViewProps {
  prescription?: PrescriptionData | null;
}

const hasValues = (eye?: EyeValues) =>
  eye
    ? Object.values(eye).some((value) => (value ?? "").toString().trim().length > 0)
    : false;

const formatValue = (value?: string) => (value && value.trim().length > 0 ? value : "—");

const PrescriptionView = ({ prescription }: PrescriptionViewProps) => {
  if (!prescription) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            Prescrição de Óculos
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Nenhuma prescrição foi registrada para este atendimento.
        </p>
      </Card>
    );
  }

  const showDistance =
    hasValues(prescription.distanceOD) || hasValues(prescription.distanceOE);

  const returnDate =
    prescription.returnDate && !Number.isNaN(Date.parse(prescription.returnDate))
      ? new Date(prescription.returnDate).toLocaleDateString("pt-BR")
      : formatValue(prescription.returnDate);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Prescrição de Óculos</h3>
      </div>

      <div className="space-y-8">
        {showDistance && (
          <div className="space-y-3">
            <h4 className="font-medium">Para Longe</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="text-left py-2 px-3 font-medium">Olho</th>
                    <th className="text-left py-2 px-3 font-medium">Esférico</th>
                    <th className="text-left py-2 px-3 font-medium">Cilíndrico</th>
                    <th className="text-left py-2 px-3 font-medium">Eixo</th>
                    <th className="text-left py-2 px-3 font-medium">AV</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-3 font-medium">OD</td>
                    <td className="py-3 px-3">{formatValue(prescription.distanceOD?.spherical)}</td>
                    <td className="py-3 px-3">{formatValue(prescription.distanceOD?.cylindrical)}</td>
                    <td className="py-3 px-3">{formatValue(prescription.distanceOD?.axis)}</td>
                    <td className="py-3 px-3">{formatValue(prescription.distanceOD?.av)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium">OE</td>
                    <td className="py-3 px-3">{formatValue(prescription.distanceOE?.spherical)}</td>
                    <td className="py-3 px-3">{formatValue(prescription.distanceOE?.cylindrical)}</td>
                    <td className="py-3 px-3">{formatValue(prescription.distanceOE?.axis)}</td>
                    <td className="py-3 px-3">{formatValue(prescription.distanceOE?.av)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Tipo de Lente</p>
            <p className="font-medium">{formatValue(prescription.lensType)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Adição</p>
            <p className="font-medium">{formatValue(prescription.addition)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Data de Retorno</p>
            <p className="font-medium">{returnDate}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Observações</p>
            <p className="text-sm leading-relaxed">
              {formatValue(prescription.observations)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Recomendações</p>
            <p className="text-sm leading-relaxed">
              {formatValue(prescription.recommendations)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PrescriptionView;

import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface PrescriptionData {
  distance: {
    od: {
      spherical: string;
      cylindrical: string;
      axis: string;
      av: string;
    };
    oe: {
      spherical: string;
      cylindrical: string;
      axis: string;
      av: string;
    };
  };
  lensType: string;
  returnDate: string;
  observations: string;
  recommendations: string;
}

interface PrescriptionViewProps {
  prescription: PrescriptionData;
}

const PrescriptionView = ({ prescription }: PrescriptionViewProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Prescrição de Óculos</h3>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Para Longe</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Olho</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Esférico</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Cilíndrico</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Eixo</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">AV</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-3 font-medium">OD</td>
                  <td className="py-3 px-3">{prescription.distance.od.spherical}</td>
                  <td className="py-3 px-3">{prescription.distance.od.cylindrical}</td>
                  <td className="py-3 px-3">{prescription.distance.od.axis}</td>
                  <td className="py-3 px-3">{prescription.distance.od.av}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-3 font-medium">OE</td>
                  <td className="py-3 px-3">{prescription.distance.oe.spherical}</td>
                  <td className="py-3 px-3">{prescription.distance.oe.cylindrical}</td>
                  <td className="py-3 px-3">{prescription.distance.oe.axis}</td>
                  <td className="py-3 px-3">{prescription.distance.oe.av}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Tipo de Lente</p>
            <p className="font-medium">{prescription.lensType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Data de Retorno</p>
            <p className="font-medium">{prescription.returnDate}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Observações</p>
          <p className="text-sm">{prescription.observations}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Recomendações</p>
          <p className="text-sm">{prescription.recommendations}</p>
        </div>
      </div>
    </Card>
  );
};

export default PrescriptionView;

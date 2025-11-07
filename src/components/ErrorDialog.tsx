import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  details?: string[];
}

export default function ErrorDialog({
  open,
  onOpenChange,
  title = "Erro de Validação",
  message,
  details,
}: ErrorDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px] border-red-200 bg-gradient-to-br from-red-50 to-white">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-red-700">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-gray-700 mt-4">
            {message}
          </AlertDialogDescription>
          
          {details && details.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-gray-600">Detalhes:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 bg-red-50 p-4 rounded-lg border border-red-100">
                {details.map((detail, index) => (
                  <li key={index} className="text-gray-700">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => onOpenChange(false)}
            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
          >
            Entendi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


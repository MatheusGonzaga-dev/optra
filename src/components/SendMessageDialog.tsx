import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ImagePlus, Send } from "lucide-react";

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName?: string;
}

export default function SendMessageDialog({
  open,
  onOpenChange,
  patientName,
}: SendMessageDialogProps) {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const handleSend = () => {
    if (!message.trim() && images.length === 0) {
      toast.error("Adicione uma mensagem ou imagem");
      return;
    }

    toast.success(`Mensagem enviada para ${patientName || "o paciente"}!`);
    setMessage("");
    setImages([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Enviar Mensagem {patientName && `para ${patientName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Mensagem</Label>
            <Textarea
              placeholder="Digite sua mensagem aqui..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px] mt-2"
            />
          </div>

          <div>
            <Label>Anexar Imagens (Opcional)</Label>
            <div className="mt-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                Adicionar Imagens
              </Button>
            </div>

            {images.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-muted-foreground">
                  {images.length} imagem(ns) selecionada(s)
                </p>
                <div className="flex flex-wrap gap-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-accent px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      {img.name}
                      <button
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button onClick={handleSend} className="flex-1">
              <Send className="mr-2 h-4 w-4" />
              Enviar Mensagem
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

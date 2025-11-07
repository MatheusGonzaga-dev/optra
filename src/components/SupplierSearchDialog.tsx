import { useState, useEffect } from "react";
import { Loader2, Building2, Search, Check } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

interface Supplier {
  id: string;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  estado?: string;
  ativo: boolean;
}

interface SupplierSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (supplierName: string) => void;
}

const SupplierSearchDialog = ({ open, onOpenChange, onSelect }: SupplierSearchDialogProps) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchSuppliers();
    }
  }, [open]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/fornecedores');
      if (!response.ok) {
        throw new Error('Erro ao buscar fornecedores');
      }
      const data = await response.json();
      // Filtrar apenas fornecedores ativos
      const activeSuppliers = (data || []).filter((s: Supplier) => s.ativo !== false);
      setSuppliers(activeSuppliers);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (value: string) => {
    // O valor vem como string do CommandItem, precisamos encontrar o supplier
    const supplier = suppliers.find((s) => 
      `${s.nome} ${s.cnpj || ''} ${s.telefone || ''} ${s.email || ''} ${s.cidade || ''} ${s.estado || ''}` === value
    );
    
    if (supplier) {
      setSelectedId(supplier.id);
      onSelect(supplier.nome);
      onOpenChange(false);
      // Reset selection after a short delay
      setTimeout(() => setSelectedId(null), 300);
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center gap-2 border-b px-6 py-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Selecione um Fornecedor</h2>
          <p className="text-sm text-muted-foreground">
            Busque por nome, CNPJ, telefone, email ou cidade
          </p>
        </div>
      </div>
      
      <CommandInput 
        placeholder="Digite para buscar fornecedor..." 
        className="h-12"
      />
      
      <CommandList className="max-h-[600px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Carregando fornecedores...</span>
          </div>
        ) : (
          <>
            <CommandEmpty>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Nenhum fornecedor encontrado</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tente buscar por outro termo
                </p>
              </div>
            </CommandEmpty>
            
            <CommandGroup>
              {suppliers.map((supplier) => {
                const searchValue = `${supplier.nome} ${supplier.cnpj || ''} ${supplier.telefone || ''} ${supplier.email || ''} ${supplier.cidade || ''} ${supplier.estado || ''}`;
                return (
                  <CommandItem
                    key={supplier.id}
                    value={searchValue}
                    onSelect={handleSelect}
                    className="py-4 px-6"
                  >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{supplier.nome}</span>
                        {selectedId === supplier.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {supplier.cnpj && (
                          <Badge variant="outline" className="text-xs">
                            CNPJ: {supplier.cnpj}
                          </Badge>
                        )}
                        {supplier.cidade && supplier.estado && (
                          <Badge variant="secondary" className="text-xs">
                            {supplier.cidade}, {supplier.estado}
                          </Badge>
                        )}
                        {supplier.telefone && (
                          <span className="text-xs text-muted-foreground">
                            📞 {supplier.telefone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default SupplierSearchDialog;


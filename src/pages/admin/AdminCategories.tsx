import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Tag, Edit, Trash2, Loader2, ChevronDown, ChevronRight, Building2, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AddCategoryDialog from "@/components/AddCategoryDialog";
import EditCategoryDialog from "@/components/EditCategoryDialog";
import AddSubcategoryDialog from "@/components/AddSubcategoryDialog";
import EditSubcategoryDialog from "@/components/EditSubcategoryDialog";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/utils";

interface Categoria {
  id: string;
  nome: string;
  tipo: "RECEITA" | "DESPESA";
  cor?: string;
  icone?: string;
  descricao?: string;
  ativo: boolean;
}

interface Subcategoria {
  id: string;
  categoria_id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

const AdminCategories = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Record<string, Subcategoria[]>>({});
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState<"TODAS" | "RECEITA" | "DESPESA">("TODAS");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Dialogs state
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [isAddSubcategoryDialogOpen, setIsAddSubcategoryDialogOpen] = useState(false);
  const [isEditSubcategoryDialogOpen, setIsEditSubcategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategoria | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "category" | "subcategory"; id: string; nome: string } | null>(null);

  useEffect(() => {
    fetchCategorias();
  }, [tipoFiltro]);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const url = tipoFiltro === "TODAS" 
        ? `${API_BASE_URL}/categorias`
        : `${API_BASE_URL}/categorias?tipo=${tipoFiltro}`;
      
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Erro ao buscar categorias');
      const data = await resp.json();
      setCategorias(data || []);
      
      // Expandir primeira categoria por padrão
      if (data && data.length > 0 && expandedCategories.size === 0) {
        setExpandedCategories(new Set([data[0].id]));
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategorias = async (categoriaId: string) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/categorias/${categoriaId}/subcategorias`);
      if (!resp.ok) throw new Error('Erro ao buscar subcategorias');
      const data = await resp.json();
      setSubcategorias(prev => ({ ...prev, [categoriaId]: data || [] }));
    } catch (error) {
      console.error('Erro ao buscar subcategorias:', error);
      setSubcategorias(prev => ({ ...prev, [categoriaId]: [] }));
    }
  };

  const toggleCategory = (categoriaId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoriaId)) {
        newSet.delete(categoriaId);
      } else {
        newSet.add(categoriaId);
        if (!subcategorias[categoriaId]) {
          fetchSubcategorias(categoriaId);
        }
      }
      return newSet;
    });
  };

  const handleAddCategory = async (category: Omit<Categoria, "id">) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: category.nome,
          tipo: category.tipo,
          cor: category.cor || '#3b82f6',
          icone: category.icone,
          descricao: category.descricao,
          ativo: category.ativo,
        })
      });
      if (!resp.ok) throw new Error();
      await fetchCategorias();
      toast.success("Categoria adicionada com sucesso!");
    } catch {
      toast.error('Erro ao adicionar categoria');
    }
  };

  const handleEditCategory = async (updatedCategory: Categoria) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/categorias/${updatedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: updatedCategory.nome,
          tipo: updatedCategory.tipo,
          cor: updatedCategory.cor,
          icone: updatedCategory.icone,
          descricao: updatedCategory.descricao,
          ativo: updatedCategory.ativo,
        })
      });
      if (!resp.ok) throw new Error();
      await fetchCategorias();
      toast.success("Categoria atualizada com sucesso!");
    } catch {
      toast.error('Erro ao atualizar categoria');
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteTarget) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/categorias/${deleteTarget.id}`, {
        method: 'DELETE'
      });
      if (!resp.ok) throw new Error();
      await fetchCategorias();
      toast.success("Categoria excluída com sucesso!");
    } catch {
      toast.error('Erro ao excluir categoria');
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleAddSubcategory = async (subcategory: Omit<Subcategoria, "id"> & { categoria_id: string }) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/categorias/subcategorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoria_id: subcategory.categoria_id,
          nome: subcategory.nome,
          descricao: subcategory.descricao,
          ativo: subcategory.ativo,
        })
      });
      if (!resp.ok) throw new Error();
      await fetchSubcategorias(subcategory.categoria_id);
      toast.success("Subcategoria adicionada com sucesso!");
    } catch {
      toast.error('Erro ao adicionar subcategoria');
    }
  };

  const handleEditSubcategory = async (updatedSubcategory: Subcategoria) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/categorias/subcategorias/${updatedSubcategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoria_id: updatedSubcategory.categoria_id,
          nome: updatedSubcategory.nome,
          descricao: updatedSubcategory.descricao,
          ativo: updatedSubcategory.ativo,
        })
      });
      if (!resp.ok) throw new Error();
      await fetchSubcategorias(updatedSubcategory.categoria_id);
      toast.success("Subcategoria atualizada com sucesso!");
    } catch {
      toast.error('Erro ao atualizar subcategoria');
    }
  };

  const handleDeleteSubcategory = async () => {
    if (!deleteTarget) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/categorias/subcategorias/${deleteTarget.id}`, {
        method: 'DELETE'
      });
      if (!resp.ok) throw new Error();
      if (selectedCategory) {
        await fetchSubcategorias(selectedCategory.id);
      }
      toast.success("Subcategoria excluída com sucesso!");
    } catch {
      toast.error('Erro ao excluir subcategoria');
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleDeleteClick = (type: "category" | "subcategory", item: Categoria | Subcategoria) => {
    setDeleteTarget({ type, id: item.id, nome: 'nome' in item ? item.nome : (item as Subcategoria).nome });
    setDeleteDialogOpen(true);
  };

  const filteredCategorias = categorias.filter(cat => {
    if (tipoFiltro === "TODAS") return true;
    return cat.tipo === tipoFiltro;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
              <Tag className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Categorias Financeiras
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie categorias e subcategorias para classificar receitas e despesas
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAddCategoryDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Adicionar Categoria
          </Button>
        </div>

        {/* Filtro */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">Filtrar por tipo:</Label>
              <Select value={tipoFiltro} onValueChange={(value: "TODAS" | "RECEITA" | "DESPESA") => setTipoFiltro(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODAS">Todas</SelectItem>
                  <SelectItem value="RECEITA">Receitas</SelectItem>
                  <SelectItem value="DESPESA">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Categorias */}
        {loading ? (
          <Card className="p-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Carregando categorias...</p>
            </div>
          </Card>
        ) : filteredCategorias.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhuma categoria cadastrada</p>
              <p className="mt-1">Clique em "Adicionar Categoria" para começar</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCategorias.map((categoria) => {
              const isExpanded = expandedCategories.has(categoria.id);
              const categoriaSubcategorias = subcategorias[categoria.id] || [];

              return (
                <Card key={categoria.id} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleCategory(categoria.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: categoria.cor || '#3b82f6' }}
                        />
                        <div className="flex-1">
                          <CardTitle className="text-xl flex items-center gap-2">
                            {categoria.nome}
                            <Badge variant={categoria.tipo === "RECEITA" ? "default" : "secondary"}>
                              {categoria.tipo === "RECEITA" ? (
                                <>
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Receita
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                  Despesa
                                </>
                              )}
                            </Badge>
                            {!categoria.ativo && (
                              <Badge variant="outline" className="ml-2">Inativo</Badge>
                            )}
                          </CardTitle>
                          {categoria.descricao && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {categoria.descricao}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {categoriaSubcategorias.length} subcategoria(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(categoria);
                            setIsEditCategoryDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick("category", categoria);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(categoria);
                            setIsAddSubcategoryDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Subcategoria
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="pt-0 pb-6">
                      {!subcategorias[categoria.id] && (
                        <div className="text-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                          <p className="text-sm text-muted-foreground">Carregando subcategorias...</p>
                        </div>
                      )}
                      {subcategorias[categoria.id]?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Tag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Nenhuma subcategoria cadastrada</p>
                          <Button
                            variant="link"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setSelectedCategory(categoria);
                              setIsAddSubcategoryDialogOpen(true);
                            }}
                          >
                            Adicionar primeira subcategoria
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2 mt-4">
                          {categoriaSubcategorias.map((subcategoria) => (
                            <Card key={subcategoria.id} className="bg-muted/30">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{subcategoria.nome}</span>
                                      {!subcategoria.ativo && (
                                        <Badge variant="outline" className="text-xs">Inativo</Badge>
                                      )}
                                    </div>
                                    {subcategoria.descricao && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {subcategoria.descricao}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        setSelectedSubcategory(subcategoria);
                                        setSelectedCategory(categoria);
                                        setIsEditSubcategoryDialogOpen(true);
                                      }}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => handleDeleteClick("subcategory", subcategoria)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialogs */}
        <AddCategoryDialog
          open={isAddCategoryDialogOpen}
          onOpenChange={setIsAddCategoryDialogOpen}
          onAdd={handleAddCategory}
        />

        <EditCategoryDialog
          open={isEditCategoryDialogOpen}
          onOpenChange={setIsEditCategoryDialogOpen}
          category={selectedCategory}
          onEdit={handleEditCategory}
        />

        <AddSubcategoryDialog
          open={isAddSubcategoryDialogOpen}
          onOpenChange={setIsAddSubcategoryDialogOpen}
          category={selectedCategory}
          onAdd={handleAddSubcategory}
        />

        <EditSubcategoryDialog
          open={isEditSubcategoryDialogOpen}
          onOpenChange={setIsEditSubcategoryDialogOpen}
          subcategory={selectedSubcategory}
          category={selectedCategory}
          onEdit={handleEditSubcategory}
        />

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir {deleteTarget?.type === "category" ? "categoria" : "subcategoria"}</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir {deleteTarget?.type === "category" ? "a categoria" : "a subcategoria"} <strong>{deleteTarget?.nome}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  if (deleteTarget?.type === "category") {
                    handleDeleteCategory();
                  } else {
                    handleDeleteSubcategory();
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminCategories;

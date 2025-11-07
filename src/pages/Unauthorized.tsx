import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-6xl font-bold mb-4">403</h1>
      <p className="text-lg text-muted-foreground mb-6">Acesso não autorizado</p>
      <Button onClick={() => navigate(-1)}>Voltar</Button>
    </div>
  );
};

export default Unauthorized;





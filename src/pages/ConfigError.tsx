import { AlertCircle, Settings, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ConfigError = () => {
  const missingVars: string[] = [];
  
  if (!import.meta.env.VITE_SUPABASE_URL) {
    missingVars.push("VITE_SUPABASE_URL");
  }
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    missingVars.push("VITE_SUPABASE_ANON_KEY");
  }
  
  // VITE_API_URL é opcional - não adiciona à lista de obrigatórias

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-2xl border-2 border-red-200 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-100 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-red-700 mb-2">
            Configuração Necessária
          </CardTitle>
          <CardDescription className="text-lg">
            Variáveis de ambiente não configuradas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-red-800 mb-2">
              As seguintes variáveis de ambiente estão faltando:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              {missingVars.map((varName) => (
                <li key={varName} className="font-mono font-semibold">
                  {varName}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Como configurar na Vercel:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
              <li>Acesse o painel da Vercel</li>
              <li>Vá em <strong>Settings</strong> → <strong>Environment Variables</strong></li>
              <li>Adicione as seguintes variáveis:</li>
            </ol>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              <div className="space-y-1">
                <div>VITE_SUPABASE_URL=https://seu-projeto.supabase.co</div>
                <div>VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui</div>
                <div className="text-gray-500"># VITE_API_URL é opcional (veja instruções abaixo)</div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                📌 Sobre VITE_API_URL (Opcional):
              </p>
              <p className="text-xs text-yellow-700 mb-2">
                Esta variável só é necessária se você já fez deploy do backend. Se ainda não fez:
              </p>
              <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1">
                <li>Você pode deixar sem configurar por enquanto</li>
                <li>O sistema usará <code className="bg-yellow-100 px-1 rounded">http://localhost:4000</code> como padrão</li>
                <li>Funcionalidades que dependem do backend não funcionarão até você fazer o deploy</li>
              </ul>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => window.location.reload()}
                variant="default"
                className="flex-1"
              >
                Tentar Novamente
              </Button>
              <Button
                onClick={() => window.open("https://vercel.com/docs/concepts/projects/environment-variables", "_blank")}
                variant="outline"
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Documentação
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              <strong>Dica:</strong> Após adicionar as variáveis de ambiente, você precisará fazer um novo deploy 
              ou aguardar alguns minutos para que as mudanças sejam aplicadas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigError;


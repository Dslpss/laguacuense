"use client";

import { useTimes } from "@/hooks/useTimes";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { removerTime } from "@/lib/firebase/firestore";
import { adicionarJogador } from "@/lib/firebase/firestore";
import { useState, useEffect } from "react";
import { uploadLogo } from "@/lib/firebase/storage";
import { atualizarTime } from "@/lib/firebase/firestore";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ListaTimes() {
  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(6); // 6 times por página (2 linhas de 3 colunas)

  // Hooks para edição/adição de logo do time
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoTimeSelecionado, setLogoTimeSelecionado] = useState<{
    id: string;
    nome: string;
    logoUrl?: string;
  } | null>(null);
  const [salvandoLogo, setSalvandoLogo] = useState(false);

  const abrirLogoDialog = (id: string, nome: string, logoUrl?: string) => {
    setLogoTimeSelecionado({ id, nome, logoUrl });
    setLogoFile(null);
    setLogoPreview(logoUrl || "");
    setLogoDialogOpen(true);
  };



  // Função para converter arquivo para base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const salvarLogo = async () => {
    if (!logoTimeSelecionado) {
      console.log("❌ Erro: logoTimeSelecionado é null");
      return;
    }
    
    console.log("🚀 Iniciando salvamento da logo...");
    console.log("📁 Arquivo selecionado:", logoFile);
    console.log("🏆 Time selecionado:", logoTimeSelecionado);
    
    setSalvandoLogo(true);
    try {
      let logoUrl = logoTimeSelecionado.logoUrl || "";
      
      if (logoFile) {
        console.log("🔄 Convertendo imagem para base64...");
        console.log("📄 Detalhes do arquivo:", {
          name: logoFile.name,
          size: logoFile.size,
          type: logoFile.type
        });
        
        // Validar tipo de arquivo
        if (!logoFile.type.startsWith('image/')) {
          throw new Error('Por favor, selecione apenas arquivos de imagem');
        }
        
        // Validar tamanho do arquivo (2MB max para base64)
        if (logoFile.size > 2 * 1024 * 1024) {
          throw new Error('O arquivo deve ter no máximo 2MB para conversão base64');
        }
        
        // Converter para base64
        logoUrl = await fileToBase64(logoFile);
        console.log("✅ Conversão para base64 concluída!");
        console.log("📏 Tamanho do base64:", logoUrl.length, "caracteres");
      } else {
        console.log("⚠️ Nenhum arquivo selecionado, mantendo URL atual");
        // Se não há arquivo e não há URL atual, não faz nada
        if (!logoUrl) {
          console.log("ℹ️ Nenhuma alteração necessária - sem arquivo e sem URL atual");
          alert("Nenhuma alteração foi feita");
          setLogoDialogOpen(false);
          return;
        }
      }
      
      console.log("💾 Atualizando time no Firestore...");
      await atualizarTime(logoTimeSelecionado.id, { logoUrl });
      console.log("✅ Time atualizado com sucesso!");
      
      const mensagem = logoFile ? "Logo atualizada com sucesso!" : "Logo mantida";
      alert(mensagem);
      setLogoDialogOpen(false);
      
      // Limpar estados
      setLogoFile(null);
      setLogoPreview("");
      setLogoTimeSelecionado(null);
      
    } catch (error) {
      console.error("❌ Erro detalhado ao salvar logo:", error);
      console.error("📊 Stack trace:", error instanceof Error ? error.stack : 'N/A');
      
      // Mensagens de erro mais específicas
      let mensagemErro = "Erro desconhecido";
      if (error instanceof Error) {
        mensagemErro = error.message;
      }
      
      alert(`Erro ao salvar logo: ${mensagemErro}`);
    } finally {
      console.log("🏁 Finalizando processo de salvamento...");
      setSalvandoLogo(false);
    }
  };
  const { times, carregando, erro } = useTimes();
  
  // Cálculos para paginação
  const totalPaginas = Math.ceil(times.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const timesExibidos = times.slice(indiceInicio, indiceFim);

  // Ajustar página atual se necessário quando times são removidos
  useEffect(() => {
    if (paginaAtual > totalPaginas && totalPaginas > 0) {
      setPaginaAtual(totalPaginas);
    }
  }, [times.length, totalPaginas, paginaAtual]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [timeSelecionado, setTimeSelecionado] = useState<{
    id: string;
    nome: string;
  } | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [nomeJogador, setNomeJogador] = useState("");
  const [posicaoJogador, setPosicaoJogador] = useState<string>("");
  const [numeroJogador, setNumeroJogador] = useState<string>("");
  const [idadeJogador, setIdadeJogador] = useState<string>("");
  const [salvandoJogador, setSalvandoJogador] = useState(false);
  const [erroJogador, setErroJogador] = useState<string | null>(null);
  const [cpfJogador, setCpfJogador] = useState<string>("");

  const abrirCadastroJogador = (id: string, nome: string) => {
    setTimeSelecionado({ id, nome });
    setNomeJogador("");
    setPosicaoJogador("");
    setNumeroJogador("");
    setIdadeJogador("");
    setErroJogador(null);
    setAddOpen(true);
  };

  const salvarJogador = async () => {
    if (!timeSelecionado) return;
    // Validações mínimas
    if (!nomeJogador.trim() || !posicaoJogador || !numeroJogador) {
      setErroJogador("Preencha nome, posição e número.");
      return;
    }
    const numero = Number(numeroJogador);
    if (Number.isNaN(numero) || numero < 1 || numero > 99) {
      setErroJogador("Número deve ser entre 1 e 99.");
      return;
    }
    const idade = idadeJogador ? Number(idadeJogador) : undefined;
    // Validação simples de CPF (opcional): remover não dígitos e checar tamanho 11
    const cpfSanitizado = cpfJogador.replace(/\D/g, "");
    if (cpfJogador && cpfSanitizado.length !== 11) {
      setErroJogador("CPF deve ter 11 dígitos (somente números).");
      return;
    }
    if (idadeJogador && (Number.isNaN(idade!) || idade! <= 0)) {
      setErroJogador("Idade deve ser um número positivo.");
      return;
    }
    setSalvandoJogador(true);
    setErroJogador(null);
    try {
      await adicionarJogador(timeSelecionado.id, {
        nome: nomeJogador.trim(),
        posicao: posicaoJogador,
        numero,
        ...(idade ? { idade } : {}),
        ...(cpfJogador ? { cpf: cpfSanitizado } : {}),
      });
      setAddOpen(false);
    } catch (e) {
      console.error(e);
      setErroJogador("Falha ao salvar jogador. Tente novamente.");
    } finally {
      setSalvandoJogador(false);
    }
  };

  const pedirConfirmacaoExclusao = (id: string, nome: string) => {
    setTimeSelecionado({ id, nome });
    setConfirmOpen(true);
  };

  const confirmarExclusao = async () => {
    if (!timeSelecionado) return;
    setExcluindo(true);
    try {
      await removerTime(timeSelecionado.id);
      setConfirmOpen(false);
      setTimeSelecionado(null);
    } catch (e) {
      console.error("Falha ao remover time:", e);
      // Opcional: adicionar toast de erro
    } finally {
      setExcluindo(false);
    }
  };

  if (carregando) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Times Inscritos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Carregando times...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (erro) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Times Inscritos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-red-500">Erro ao carregar times</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Times Inscritos</CardTitle>
        <CardDescription>
          Total: {times.length} times
          {times.length === 16 && (
            <Badge variant="secondary" className="ml-2">
              Pronto para sorteio!
            </Badge>
          )}
        </CardDescription>

      </CardHeader>
      <CardContent>
        {times.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Nenhum time cadastrado ainda
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timesExibidos.map((time) => (
                <Card key={time.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {time.logoUrl ? (
                        <Image
                          src={time.logoUrl}
                          alt={"Logo de " + time.nome}
                          width={48}
                          height={48}
                          className="object-contain rounded border bg-white"
                          style={{ maxWidth: "48px", maxHeight: "48px" }}
                          unoptimized
                        />
                      ) : (
                        <div className="h-12 w-12 flex items-center justify-center bg-muted rounded border text-xs text-muted-foreground">
                          Sem logo
                        </div>
                      )}
                      <h3 className="font-semibold">{time.nome}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{time.cidade}</p>
                    {time.grupo && (
                      <Badge variant="outline">Grupo {time.grupo}</Badge>
                    )}
                    <div className="pt-2 flex flex-wrap gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          pedirConfirmacaoExclusao(time.id!, time.nome)
                        }
                      >
                        Remover
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => abrirCadastroJogador(time.id!, time.nome)}
                      >
                        Adicionar jogador
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          abrirLogoDialog(time.id!, time.nome, time.logoUrl)
                        }
                      >
                        {time.logoUrl ? "Editar logo" : "Adicionar logo"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Controles de paginação */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-green-200/50">
                <div className="text-sm text-muted-foreground">
                  Mostrando {indiceInicio + 1} a {Math.min(indiceFim, times.length)} de {times.length} times
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                      <Button
                        key={pagina}
                        variant={pagina === paginaAtual ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPaginaAtual(pagina)}
                        className="h-8 w-8 p-0"
                      >
                        {pagina}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Dialog para editar/adicionar logo do time */}
      <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-50 border-green-200/50 shadow-2xl">
          <DialogHeader className="space-y-3 pb-4 border-b border-green-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-green-800 to-slate-900 bg-clip-text text-transparent">
                {logoTimeSelecionado?.logoUrl
                  ? "Editar logo do time"
                  : "Adicionar logo ao time"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-slate-600 pl-14">
              Time:{" "}
              <strong className="text-slate-900">
                {logoTimeSelecionado?.nome}
              </strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="bg-white/60 backdrop-blur-sm p-5 rounded-xl border border-green-100 shadow-md space-y-4">
              <Label
                htmlFor="logoTime"
                className="text-base font-semibold text-slate-700 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Selecione o arquivo da logo
              </Label>
              <Input
                id="logoTime"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setLogoFile(e.target.files[0]);
                    setLogoPreview(URL.createObjectURL(e.target.files[0]));
                  } else {
                    setLogoFile(null);
                    setLogoPreview(logoTimeSelecionado?.logoUrl || "");
                  }
                }}
                disabled={salvandoLogo}
                className="h-11 border-green-200 focus:border-green-500 focus:ring-green-500/20"
              />
              {logoPreview && (
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white p-4 rounded-2xl border-2 border-green-200 shadow-lg">
                      <Image
                        src={logoPreview}
                        alt="Prévia da logo"
                        width={96}
                        height={96}
                        className="object-contain rounded-lg"
                        style={{ maxWidth: "96px", maxHeight: "96px" }}
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 pt-4 border-t border-green-200/50">
            <Button
              variant="secondary"
              onClick={() => setLogoDialogOpen(false)}
              disabled={salvandoLogo}
              className="h-11 px-6 hover:bg-slate-200"
            >
              Cancelar
            </Button>
            <Button
              onClick={salvarLogo}
              disabled={salvandoLogo}
              className="h-11 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {salvandoLogo ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Salvar logo
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-lg bg-gradient-to-br from-red-50 via-orange-50/30 to-red-50 border-red-200/50 shadow-2xl">
          <DialogHeader className="space-y-3 pb-4 border-b border-red-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Remover time
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-slate-600 pl-14">
              Esta ação é permanente e removerá também os jogadores cadastrados
              para este time.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {timeSelecionado && (
              <div className="bg-white/60 backdrop-blur-sm p-5 rounded-xl border border-red-100 shadow-md">
                <p className="text-base text-slate-700">
                  Tem certeza que deseja remover o time{" "}
                  <strong className="text-red-600 font-bold text-lg">
                    {timeSelecionado.nome}
                  </strong>
                  ?
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 pt-4 border-t border-red-200/50">
            <Button
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              disabled={excluindo}
              className="h-11 px-6 hover:bg-slate-200"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarExclusao}
              disabled={excluindo}
              className="h-11 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {excluindo ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Removendo...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Remover
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-3xl bg-gradient-to-br from-blue-50 via-sky-50/30 to-blue-50 border-blue-200/50 shadow-2xl">
          <DialogHeader className="space-y-3 pb-4 border-b border-blue-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                Adicionar jogador
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-slate-600 pl-14">
              Preencha os dados do jogador para o time selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {timeSelecionado && (
              <div className="bg-blue-100/50 backdrop-blur-sm p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-700">
                  Time:{" "}
                  <strong className="text-blue-700 text-base">
                    {timeSelecionado.nome}
                  </strong>
                </p>
              </div>
            )}
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-blue-100 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="nome"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Nome
                  </Label>
                  <Input
                    id="nome"
                    placeholder="Ex.: João Silva"
                    value={nomeJogador}
                    onChange={(e) => setNomeJogador(e.target.value)}
                    className="h-11 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="posicao"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Posição
                  </Label>
                  <Select
                    value={posicaoJogador}
                    onValueChange={setPosicaoJogador}
                  >
                    <SelectTrigger
                      id="posicao"
                      className="h-11 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                    >
                      <SelectValue placeholder="Selecione a posição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Goleiro">Goleiro</SelectItem>
                      <SelectItem value="Zagueiro">Zagueiro</SelectItem>
                      <SelectItem value="Lateral">Lateral</SelectItem>
                      <SelectItem value="Volante">Volante</SelectItem>
                      <SelectItem value="Meia">Meia</SelectItem>
                      <SelectItem value="Atacante">Atacante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="numero"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    </svg>
                    Número
                  </Label>
                  <Input
                    id="numero"
                    type="number"
                    min={1}
                    max={99}
                    placeholder="Ex.: 10"
                    value={numeroJogador}
                    onChange={(e) => setNumeroJogador(e.target.value)}
                    className="h-11 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="idade"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Idade (opcional)
                  </Label>
                  <Input
                    id="idade"
                    type="number"
                    min={1}
                    placeholder="Ex.: 23"
                    value={idadeJogador}
                    onChange={(e) => setIdadeJogador(e.target.value)}
                    className="h-11 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="cpf"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                      />
                    </svg>
                    CPF (opcional)
                  </Label>
                  <Input
                    id="cpf"
                    placeholder="Somente números"
                    value={cpfJogador}
                    onChange={(e) => setCpfJogador(e.target.value)}
                    className="h-11 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
            {erroJogador && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-600 font-medium">
                  {erroJogador}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 pt-4 border-t border-blue-200/50">
            <Button
              variant="secondary"
              onClick={() => setAddOpen(false)}
              disabled={salvandoJogador}
              className="h-11 px-6 hover:bg-slate-200"
            >
              Cancelar
            </Button>
            <Button
              onClick={salvarJogador}
              disabled={salvandoJogador}
              className="h-11 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {salvandoJogador ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Salvar
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

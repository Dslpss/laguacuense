"use client";

import { useTimes } from "@/hooks/useTimes";
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
import { useState } from "react";

export function ListaTimes() {
  const { times, carregando, erro } = useTimes();
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {times.map((time) => (
              <Card key={time.id} className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">{time.nome}</h3>
                  <p className="text-sm text-muted-foreground">{time.cidade}</p>
                  {time.grupo && (
                    <Badge variant="outline">Grupo {time.grupo}</Badge>
                  )}
                  <div className="pt-2">
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
                      className="ml-2"
                      variant="secondary"
                      size="sm"
                      onClick={() => abrirCadastroJogador(time.id!, time.nome)}
                    >
                      Adicionar jogador
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover time</DialogTitle>
            <DialogDescription>
              Esta ação é permanente e removerá também os jogadores cadastrados
              para este time.
            </DialogDescription>
          </DialogHeader>
          <div>
            {timeSelecionado && (
              <p>
                Tem certeza que deseja remover o time{" "}
                <strong>{timeSelecionado.nome}</strong>?
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              disabled={excluindo}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarExclusao}
              disabled={excluindo}
            >
              {excluindo ? "Removendo..." : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar jogador</DialogTitle>
            <DialogDescription>
              Preencha os dados do jogador para o time selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {timeSelecionado && (
              <p className="text-sm text-muted-foreground">
                Time: <strong>{timeSelecionado.nome}</strong>
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  placeholder="Ex.: João Silva"
                  value={nomeJogador}
                  onChange={(e) => setNomeJogador(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="posicao">Posição</Label>
                <Select
                  value={posicaoJogador}
                  onValueChange={setPosicaoJogador}
                >
                  <SelectTrigger id="posicao">
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
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  type="number"
                  min={1}
                  max={99}
                  placeholder="Ex.: 10"
                  value={numeroJogador}
                  onChange={(e) => setNumeroJogador(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idade">Idade (opcional)</Label>
                <Input
                  id="idade"
                  type="number"
                  min={1}
                  placeholder="Ex.: 23"
                  value={idadeJogador}
                  onChange={(e) => setIdadeJogador(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF (opcional)</Label>
                <Input
                  id="cpf"
                  placeholder="Somente números"
                  value={cpfJogador}
                  onChange={(e) => setCpfJogador(e.target.value)}
                />
              </div>
            </div>
            {erroJogador && (
              <p className="text-sm text-red-500">{erroJogador}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setAddOpen(false)}
              disabled={salvandoJogador}
            >
              Cancelar
            </Button>
            <Button onClick={salvarJogador} disabled={salvandoJogador}>
              {salvandoJogador ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

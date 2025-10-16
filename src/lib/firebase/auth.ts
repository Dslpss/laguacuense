import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  AuthError,
} from "firebase/auth";
import { auth } from "./config";

// Fazer login com email e senha
export const fazerLogin = async (email: string, senha: string) => {
  try {
    const resultado = await signInWithEmailAndPassword(auth, email, senha);
    return resultado.user;
  } catch (error: unknown) {
    console.error("Erro ao fazer login:", error);
    const authError = error as AuthError;
    throw new Error(obterMensagemErro(authError.code));
  }
};

// Fazer logout
export const fazerLogout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    throw error;
  }
};

// Observar mudanças no estado de autenticação
export const observarAutenticacao = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Obter usuário atual
export const obterUsuarioAtual = () => {
  return auth.currentUser;
};

// Traduzir códigos de erro para português
function obterMensagemErro(codigo: string): string {
  switch (codigo) {
    case "auth/user-not-found":
      return "Usuário não encontrado";
    case "auth/wrong-password":
      return "Senha incorreta";
    case "auth/invalid-email":
      return "Email inválido";
    case "auth/user-disabled":
      return "Usuário desabilitado";
    case "auth/too-many-requests":
      return "Muitas tentativas de login. Tente novamente mais tarde";
    case "auth/invalid-credential":
      return "Credenciais inválidas";
    default:
      return "Erro ao fazer login. Tente novamente";
  }
}

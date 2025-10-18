import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config";

export const uploadLogo = async (
  file: File,
  teamId: string
): Promise<string> => {
  console.log("🔥 Firebase Storage: Iniciando upload...");
  console.log("📂 Caminho do arquivo:", `logos/${teamId}/${file.name}`);
  console.log("📋 Detalhes do arquivo:", {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  });
  
  // Verificar se o storage está configurado
  console.log("🏗️ Storage instance:", storage);
  console.log("🏗️ Storage app:", storage.app);
  console.log("🏗️ Storage bucket:", storage.app.options.storageBucket);
  
  try {
    console.log("📍 Criando referência...");
    const storageRef = ref(storage, `logos/${teamId}/${file.name}`);
    console.log("📍 Referência criada:", {
      fullPath: storageRef.fullPath,
      bucket: storageRef.bucket,
      name: storageRef.name
    });
    
    console.log("⬆️ Iniciando upload de bytes...");
    console.log("📦 Arquivo para upload:", file);
    
    const uploadResult = await uploadBytes(storageRef, file);
    console.log("✅ Upload de bytes concluído:", {
      metadata: uploadResult.metadata,
      ref: uploadResult.ref.fullPath
    });
    
    console.log("🔗 Obtendo URL de download...");
    const url = await getDownloadURL(storageRef);
    console.log("✅ URL obtida com sucesso:", url);
    
    return url;
  } catch (error) {
     console.error("❌ Erro no Firebase Storage:", error);
     console.error("📊 Detalhes completos do erro:", error);
     console.error("📊 Tipo do erro:", typeof error);
     console.error("📊 Constructor:", error?.constructor?.name);
     
     if (error instanceof Error) {
       console.error("📊 Error message:", error.message);
       console.error("📊 Error stack:", error.stack);
     }
     
     throw error;
   }
};

export default storage;

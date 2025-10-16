import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "./config";

const storage = getStorage(app);

export const uploadLogo = async (
  file: File,
  teamId: string
): Promise<string> => {
  const storageRef = ref(storage, `logos/${teamId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
};

export default storage;

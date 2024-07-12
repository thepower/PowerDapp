import axios from 'axios';
import appEnvs from 'appEnvs';

async function calculateSHA256(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create a FileReader to read the contents of the file
    const reader = new FileReader();

    // Event handler for when the file is loaded
    reader.onload = async (event) => {
      try {
        // Get the ArrayBuffer of the file contents
        const arrayBuffer = event.target?.result as ArrayBuffer;

        // Convert the ArrayBuffer to a Uint8Array
        const uint8Array = new Uint8Array(arrayBuffer);

        // Use the SubtleCrypto API to calculate the SHA-256 hash
        const hashBuffer = await crypto.subtle.digest('SHA-256', uint8Array);

        // Convert the hashBuffer to a hexadecimal string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('');

        // Resolve the promise with the hash
        resolve(hashHex);
      } catch (error) {
        // Reject the promise if an error occurs
        reject(error);
      }
    };

    // Event handler for when an error occurs during file reading
    reader.onerror = (error) => {
      reject(error);
    };

    // Read the contents of the file as an ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
}

export async function uploadFile(file: File, id: string) {
  const hash = await calculateSHA256(file);

  const re = /(?:\.([^.]+))?$/;
  const extension = re.exec(file.name)?.[1];
  try {
    const formData = new FormData();
    formData.append(file.name, file);

    await axios.post(
      `${appEnvs.OPEN_RESTY_API_URL}/upload/${id}/${hash}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return extension ? `${hash}.${extension}` : hash;
  } catch (error: any) {
    const jsonError = error?.toJSON();
    if (jsonError?.status === 409) {
      return extension ? `${hash}.${extension}` : hash;
    }
    console.error(jsonError);
    return null;
  }
}

export const getLoadDataUrl = (id?: string) =>
  `${appEnvs.OPEN_RESTY_API_URL}/data/${id}`;

export const downloadFile = async (requestUrl: string, id: string) => {
  try {
    const response = await axios.get<Blob>(
      `${getLoadDataUrl(id)}/${requestUrl}`,
      { responseType: 'blob' }
    );
    const file = new File([response.data], requestUrl);
    return file;
  } catch (error) {
    return null;
  }
};

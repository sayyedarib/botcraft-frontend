import { apiClient } from "./client";

export const knowledgeBaseAPI = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/knowledge-base/upload", formData);
  },
  getPDFs: () => apiClient.get("/knowledge-base/pdfs"),
}

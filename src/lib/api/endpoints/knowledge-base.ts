import { apiClient } from "./client";

export const knowledgeBaseAPI = {
  uploadFile: ({workspace_id, file}: {workspace_id: string, file: File}) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workspace_id", workspace_id);
    return apiClient.post("/knowledge-base/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getPDFs: (workspace_id: string) => apiClient.get(`/knowledge-base/${workspace_id}`),
  deleteKnowledgeBase: (knowledge_base_id: string, workspace_id: string) => 
    apiClient.delete(`/knowledge-base/${knowledge_base_id}?workspace_id=${workspace_id}`)
}

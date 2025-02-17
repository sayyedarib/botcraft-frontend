import { useMutation } from "@tanstack/react-query"
import { knowledgeBaseAPI } from "@/lib/api/endpoints/knowledge-base"

export function useKnowledgeBase() {
  const uploadFileMutation = useMutation({
    mutationFn: knowledgeBaseAPI.uploadFile,
  })

  return {
    uploadFileMutation,
  }
}

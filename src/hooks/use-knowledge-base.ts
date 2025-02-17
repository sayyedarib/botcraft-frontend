import { useMutation, useQuery } from "@tanstack/react-query"
import { knowledgeBaseAPI } from "@/lib/api/endpoints/knowledge-base"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { useMemo } from "react"

export function useKnowledgeBase() {
  const { currentWorkspaceId } = useWorkspaceStore()
  
  const uploadFileMutation = useMutation({
    mutationFn: (file: File) => {
      if (!currentWorkspaceId) {
        throw new Error("No workspace selected")
      }
      return knowledgeBaseAPI.uploadFile({ workspace_id: currentWorkspaceId, file })
    }
  })

  const getPDFsQuery = useQuery({
    queryKey: ["knowledge-base", currentWorkspaceId],
    queryFn: () => {
      if (!currentWorkspaceId) {
        throw new Error("No workspace selected")
      }
      return knowledgeBaseAPI.getPDFs(currentWorkspaceId)
    },
    enabled: !!currentWorkspaceId
  })

  return useMemo(() => ({
    uploadFileMutation,
    getPDFsQuery,
  }), [uploadFileMutation, getPDFsQuery])
}

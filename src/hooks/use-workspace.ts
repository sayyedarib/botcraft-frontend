import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { workspaceAPI } from "@/lib/api/endpoints/workspace"
import { useWorkspaceStore } from "@/stores/workspace-store"

export function useWorkspace() {
  const { addWorkspace, setWorkspaces } = useWorkspaceStore()

  const createWorkspaceMutation = useMutation({
    mutationFn: workspaceAPI.createWorkspace,
    onError: (error) => {
      toast.error("Failed to create workspace", {
        description: error instanceof Error ? error.message : "Please try again",
      })
    },
    onSuccess: (data) => {
      addWorkspace(data.data)
      toast.success("Workspace created successfully")
    },
  })

  const getWorkspacesQuery = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data } = await workspaceAPI.getWorkspaces();
      // Replace the cached list rather than adding to it. This previously
      // called addWorkspace(data[0]) on every fetch, which both re-appended
      // the same workspace on each refetch and ignored all the others.
      setWorkspaces(data)
      return data;
    }
  })

  return {
    createWorkspaceMutation,
    getWorkspacesQuery,
  }
} 
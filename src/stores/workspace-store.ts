import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import { useWorkspace } from '@/hooks/use-workspace'
import { Workspace } from '@/types/workspace'

type WorkspaceState = {
  currentWorkspaceId: string | null
  workspaces: Workspace[]
  isLoading: boolean
  error: string | null
}

type WorkspaceActions = {
  setCurrentWorkspaceId: (id: string) => void
  clearCurrentWorkspace: () => void
  fetchWorkspaces: () => Promise<void>
  addWorkspace: (workspace: Workspace) => void
  removeWorkspace: (id: string) => void
}

const initialState: WorkspaceState = {
  currentWorkspaceId: null,
  workspaces: [],
  isLoading: false,
  error: null
}

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        setCurrentWorkspaceId: (id) => {
          const exists = get().workspaces.some(ws => ws._id === id)
          if (!exists) {
            console.error('Workspace not found')
            return
          }
          set({ currentWorkspaceId: id })
        },
        
        clearCurrentWorkspace: () => {
          set({ currentWorkspaceId: null })
        },
        
        fetchWorkspaces: async () => {
          const { getWorkspacesQuery } = useWorkspace()
          const { data } = getWorkspacesQuery;
          if (data) {
            set({ workspaces: data }) // Access the actual array from the Axios response
          }
        },
        
        addWorkspace: (workspace) => {
          set((state) => {
            state.workspaces.push(workspace)
            if (!state.currentWorkspaceId) {
              state.currentWorkspaceId = workspace._id
            }
          })
        },
        
        removeWorkspace: (id) => {
          set((state) => {
            state.workspaces = state.workspaces.filter((ws: Workspace) => ws._id !== id)
            if (state.currentWorkspaceId === id) {
              state.currentWorkspaceId = null
            }
          })
        }
      })),
      {
        name: 'workspace-store',
        storage: createJSONStorage(() => sessionStorage), // Use sessionStorage instead of localStorage
        partialize: (state) => ({ 
          currentWorkspaceId: state.currentWorkspaceId,
          workspaces: state.workspaces
        })
      }
    ),
    { name: 'WorkspaceStore' }
  )
)

// Selectors for optimized component usage
export const useCurrentWorkspace = () => useWorkspaceStore((state) => {
  return state.workspaces.find((ws: Workspace) => ws._id === state.currentWorkspaceId) || null
})

export const useWorkspaces = () => useWorkspaceStore((state) => state.workspaces)
export const useWorkspaceLoading = () => useWorkspaceStore((state) => state.isLoading)
export const useWorkspaceError = () => useWorkspaceStore((state) => state.error) 
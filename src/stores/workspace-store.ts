import { useShallow } from 'zustand/react/shallow'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import { Workspace } from '@/types/workspace'

type WorkspaceState = {
  currentWorkspaceId: string | null
  workspaces: Workspace[]
  isLoading: boolean
  error: string | null
  themeId: string | null
}

type WorkspaceActions = {
  setCurrentWorkspaceId: (id: string) => void
  clearCurrentWorkspace: () => void
  addWorkspace: (workspace: Workspace) => void
  setWorkspaces: (workspaces: Workspace[]) => void
  removeWorkspace: (id: string) => void
}

const initialState: WorkspaceState = {
  currentWorkspaceId: null,
  workspaces: [],
  isLoading: false,
  error: null,
  themeId: null
}

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // TODO: Rename or refactor this bcz it's handling the themeId as well.
        setCurrentWorkspaceId: (id) => {
          const exists = get().workspaces.some(ws => ws._id === id)
          const themeId = get().workspaces.find((ws: Workspace) => ws._id === id)?.theme_config_id

          if (!exists) {
            console.error('Workspace not found')
            return
          }

          set({ currentWorkspaceId: id, themeId: themeId })
        },
        
        clearCurrentWorkspace: () => {
          set({ currentWorkspaceId: null })
        },
        
        addWorkspace: (workspace) => {
          if (!workspace?._id) return

          set((state) => {
            // Upsert rather than push. This is called from a query callback
            // that re-runs on every refetch, so a plain push accumulated
            // duplicates — and the store is persisted, so they survived
            // reloads and showed up repeatedly in the workspace switcher.
            const existing = state.workspaces.findIndex(
              (ws: Workspace) => ws._id === workspace._id
            )
            if (existing >= 0) {
              state.workspaces[existing] = workspace
            } else {
              state.workspaces.push(workspace)
            }

            if (!state.currentWorkspaceId) {
              state.currentWorkspaceId = workspace._id
              state.themeId = workspace.theme_config_id
            }
          })
        },

        setWorkspaces: (workspaces) => {
          set((state) => {
            state.workspaces = workspaces ?? []

            // Drop a selection that no longer exists (e.g. access revoked).
            const stillPresent = state.workspaces.some(
              (ws: Workspace) => ws._id === state.currentWorkspaceId
            )
            if (!stillPresent) {
              const first = state.workspaces[0] ?? null
              state.currentWorkspaceId = first?._id ?? null
              state.themeId = first?.theme_config_id ?? null
            }
          })
        },

        removeWorkspace: (id) => {
          set((state) => {
            state.workspaces = state.workspaces.filter((ws: Workspace) => ws._id !== id)
            if (state.currentWorkspaceId === id) {
              state.currentWorkspaceId = null
              state.themeId = null
            }
          })
        }
      })),
      {
        name: 'workspace-store',
        storage: createJSONStorage(() => sessionStorage), // Use sessionStorage instead of localStorage
        partialize: (state) => ({ 
          currentWorkspaceId: state.currentWorkspaceId,
          themeId: state.themeId,
          workspaces: state.workspaces
        })
      }
    ),
    { name: 'WorkspaceStore' }
  )
)

export const useCurrentWorkspace = () => useWorkspaceStore(useShallow((state) => {
  return {
    workspace: state.workspaces.find((ws: Workspace) => ws._id === state.currentWorkspaceId) || null,
    themeId: state.themeId
  }
}))

export const useWorkspaces = () => useWorkspaceStore((state) => state.workspaces)
export const useWorkspaceLoading = () => useWorkspaceStore((state) => state.isLoading)
export const useWorkspaceError = () => useWorkspaceStore((state) => state.error) 
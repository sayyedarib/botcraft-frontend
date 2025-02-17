

export type Workspace = {
  name: string
  _id: string
  owner_id: string
  members: string[]
  created_at: Date
  updated_at: Date
}

export type WorkspaceCreate = {
  name: string
}

import { beforeEach, describe, expect, it } from "vitest";

import { useWorkspaceStore } from "./workspace-store";

const workspace = (id: string, themeId = `theme-${id}`) =>
  ({
    _id: id,
    name: `Workspace ${id}`,
    owner_id: "owner",
    theme_config_id: themeId,
    advanced_config_id: `cfg-${id}`,
    members: [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

const reset = () =>
  useWorkspaceStore.setState({
    currentWorkspaceId: null,
    workspaces: [],
    isLoading: false,
    error: null,
    themeId: null,
  });

const state = () => useWorkspaceStore.getState();

beforeEach(reset);

describe("addWorkspace", () => {
  it("adds a workspace", () => {
    state().addWorkspace(workspace("a"));
    expect(state().workspaces).toHaveLength(1);
  });

  it("does not duplicate on repeated calls", () => {
    // The workspaces query calls this on every refetch. A plain push meant
    // duplicates accumulated, and the store is persisted, so they survived
    // reloads and appeared repeatedly in the workspace switcher.
    state().addWorkspace(workspace("a"));
    state().addWorkspace(workspace("a"));
    state().addWorkspace(workspace("a"));

    expect(state().workspaces).toHaveLength(1);
  });

  it("updates in place when the same workspace is re-added", () => {
    state().addWorkspace(workspace("a"));
    state().addWorkspace({ ...workspace("a"), name: "Renamed" });

    expect(state().workspaces).toHaveLength(1);
    expect(state().workspaces[0].name).toBe("Renamed");
  });

  it("selects the first workspace added", () => {
    state().addWorkspace(workspace("a"));
    expect(state().currentWorkspaceId).toBe("a");
    expect(state().themeId).toBe("theme-a");
  });

  it("does not steal the selection from a later workspace", () => {
    state().addWorkspace(workspace("a"));
    state().addWorkspace(workspace("b"));
    expect(state().currentWorkspaceId).toBe("a");
  });

  it("ignores a workspace with no id", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state().addWorkspace(undefined as any);
    expect(state().workspaces).toHaveLength(0);
  });
});

describe("setWorkspaces", () => {
  it("replaces the list rather than appending", () => {
    state().addWorkspace(workspace("a"));
    state().setWorkspaces([workspace("b"), workspace("c")]);

    expect(state().workspaces.map((w) => w._id)).toEqual(["b", "c"]);
  });

  it("keeps a still-valid selection", () => {
    state().setWorkspaces([workspace("a"), workspace("b")]);
    state().setCurrentWorkspaceId("b");

    state().setWorkspaces([workspace("a"), workspace("b")]);

    expect(state().currentWorkspaceId).toBe("b");
  });

  it("re-selects when the current workspace disappears", () => {
    // e.g. the user's access was revoked between refetches.
    state().setWorkspaces([workspace("a"), workspace("b")]);
    state().setCurrentWorkspaceId("b");

    state().setWorkspaces([workspace("a")]);

    expect(state().currentWorkspaceId).toBe("a");
    expect(state().themeId).toBe("theme-a");
  });

  it("clears the selection when nothing remains", () => {
    state().setWorkspaces([workspace("a")]);
    state().setWorkspaces([]);

    expect(state().currentWorkspaceId).toBeNull();
    expect(state().themeId).toBeNull();
  });
});

describe("setCurrentWorkspaceId", () => {
  it("switches workspace and its theme together", () => {
    state().setWorkspaces([workspace("a"), workspace("b")]);
    state().setCurrentWorkspaceId("b");

    expect(state().currentWorkspaceId).toBe("b");
    expect(state().themeId).toBe("theme-b");
  });

  it("refuses an unknown workspace", () => {
    state().setWorkspaces([workspace("a")]);
    state().setCurrentWorkspaceId("does-not-exist");

    expect(state().currentWorkspaceId).toBe("a");
  });
});

describe("removeWorkspace", () => {
  it("removes it", () => {
    state().setWorkspaces([workspace("a"), workspace("b")]);
    state().removeWorkspace("a");

    expect(state().workspaces.map((w) => w._id)).toEqual(["b"]);
  });

  it("clears the selection when the current workspace is removed", () => {
    state().setWorkspaces([workspace("a")]);
    state().setCurrentWorkspaceId("a");

    state().removeWorkspace("a");

    expect(state().currentWorkspaceId).toBeNull();
    expect(state().themeId).toBeNull();
  });

  it("leaves an unrelated selection intact", () => {
    state().setWorkspaces([workspace("a"), workspace("b")]);
    state().setCurrentWorkspaceId("a");

    state().removeWorkspace("b");

    expect(state().currentWorkspaceId).toBe("a");
  });
});

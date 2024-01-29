import { toast } from "sonner";
import wretch from "wretch";
import { create } from "zustand";

import NoCredentials from "@/components/Auth/NoCredentials";
import { useAuthStore } from "@/stores/auth";
import { useModalStore } from "@/stores/modal";
import { getProject } from "@/utils/api";

import type {
  ResponseData as User,
  Response as UserResponse,
} from "@/pages/api/user";

type Project = User["projects"][0];
const error = (txt: string) =>
  toast.custom((toast) => NoCredentials(txt, toast), {
    duration: 10000,
    className: "overflow-hidden",
  });
export interface AccountStore {
  user: User | null;
  currentProject: Project | null;
  projects: Project[];
  teamId: string | null; // TODO: Implement teams
  setUser: (user: any) => void;
  refreshUser: () => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  getDefaultProject: () => Project | null;
}

export const useAccountStore = create<AccountStore>()((set, get) => ({
  user: null,
  currentProject: null,
  teamId: null,
  projects: [],
  setUser: (user: User) => {
    set({ user: user, projects: user.projects, teamId: user.team[0]?.id });

    const currentProject = get().getDefaultProject();
    get().setCurrentProject(currentProject);
  },
  refreshUser: async () => {
    const response = await wretch("/api/user")
      .auth(`Bearer ${useAuthStore.getState().token}`)
      .get()
      .badRequest((err) => err.json)
      .unauthorized((err) => err.json)
      .json<UserResponse>();

    if (!response.ok || !response.data) useAuthStore.getState().off();
    else get().setUser(response.data);
  },
  setCurrentProject: async (project) => {
    if (!project) return;

    const localProject =
      get().projects.find((p) => p.id === project.id) ??
      (await getProject(project.id)).data;

    /* Check for credentials */
    const credentials = localProject?.credentials?.contents as {
      aws?: boolean;
      gcp?: boolean;
    };
    if (!credentials || Object.keys(credentials).length === 0) {
      useModalStore.getState().set("onboarding", true, {});
    } else if (!credentials.aws)
      error(`Project \`${project.name}\` has no AWS credentials`);
    else if (!credentials.gcp)
      error(`Project \`${project.name}\` has no GCP credentials`);

    useAuthStore.getState().setCurrentProjectId(project.id);
    set({ currentProject: project });
  },
  getDefaultProject: () => {
    const projects = get().projects;
    return (
      projects.find(
        (project) => project.id === useAuthStore.getState().currentProjectId
      ) ??
      projects.find((project) => project.name === "default") ??
      projects.at(0) ??
      null
    );
  },
}));

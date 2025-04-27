import { apiClient } from "./client";
import { ThemeConfig } from "@/types/config";

export const themeAPI = {
    getTheme: (themeId: string): Promise<ThemeConfig> => apiClient.get(`/themes/${themeId}`).then((res) => res.data),
    updateTheme: (themeId: string, theme: ThemeConfig): Promise<ThemeConfig> => apiClient.put(`/themes/${themeId}`, theme).then((res) => res.data),
}

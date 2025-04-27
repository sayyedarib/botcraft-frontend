import { useMutation, useQuery } from "@tanstack/react-query";
import { themeAPI } from "@/lib/api/endpoints/theme";
import { ThemeConfig } from "@/types/config";
import { useCurrentWorkspace } from "@/stores/workspace-store";

export function useTheme() {
    const { themeId } = useCurrentWorkspace();

    if(!themeId) {
        console.error("Theme ID is null");

        return {
            getThemeQuery: null,
            updateThemeMutation: null
        }
    }
    
    const getThemeQuery = useQuery({
        queryKey: ["theme", themeId],
        queryFn: () => themeAPI.getTheme(themeId)
    })

    const updateThemeMutation = useMutation({
        mutationFn: (theme: ThemeConfig) => themeAPI.updateTheme(themeId, theme)
    })

    return {
        getThemeQuery,
        updateThemeMutation
    }
}
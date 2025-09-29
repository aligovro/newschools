import { apiClient } from '@/lib/api';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Типы для сайтов
export interface SiteTheme {
    id: string;
    name: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    customCss?: string;
}

export interface SiteSeo {
    title: string;
    description: string;
    keywords: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: string;
    canonicalUrl?: string;
    robots?: string;
}

export interface SiteMedia {
    id: string;
    type: 'image' | 'video' | 'document';
    url: string;
    thumbnail?: string;
    alt?: string;
    caption?: string;
    size: number;
    dimensions?: {
        width: number;
        height: number;
    };
    uploadedAt: string;
}

export interface Site {
    id: number;
    name: string;
    domain: string;
    subdomain?: string;
    description?: string;
    logo?: string;
    favicon?: string;
    status: 'active' | 'inactive' | 'maintenance';
    theme: SiteTheme;
    seo: SiteSeo;
    media: SiteMedia[];
    settings: {
        allowRegistration: boolean;
        allowComments: boolean;
        maintenanceMode: boolean;
        customDomain?: string;
    };
    createdAt: string;
    updatedAt: string;
    organizationId: number;
}

export interface SitesState {
    sites: Site[];
    currentSite: Site | null;
    isLoading: boolean;
    error: string | null;
    uploadProgress: number;
    isUploading: boolean;
}

// Начальное состояние
const initialState: SitesState = {
    sites: [],
    currentSite: null,
    isLoading: false,
    error: null,
    uploadProgress: 0,
    isUploading: false,
};

// Async thunks
export const fetchSites = createAsyncThunk(
    'sites/fetchSites',
    async (organizationId: number, { rejectWithValue }) => {
        try {
            const response = await apiClient.get<Site[]>(
                `/organizations/${organizationId}/sites`,
            );
            return response.data;
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message || 'Ошибка загрузки сайтов'
                    : 'Ошибка загрузки сайтов';
            return rejectWithValue(errorMessage);
        }
    },
);

export const createSite = createAsyncThunk(
    'sites/createSite',
    async (
        siteData: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>,
        { rejectWithValue },
    ) => {
        try {
            const response = await apiClient.post<Site>(
                `/organizations/${siteData.organizationId}/sites`,
                siteData,
            );
            return response.data;
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message || 'Ошибка создания сайта'
                    : 'Ошибка создания сайта';
            return rejectWithValue(errorMessage);
        }
    },
);

export const updateSite = createAsyncThunk(
    'sites/updateSite',
    async (
        {
            siteId,
            organizationId,
            updates,
        }: {
            siteId: number;
            organizationId: number;
            updates: Partial<Site>;
        },
        { rejectWithValue },
    ) => {
        try {
            const response = await apiClient.patch<Site>(
                `/organizations/${organizationId}/sites/${siteId}`,
                updates,
            );
            return response.data;
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message || 'Ошибка обновления сайта'
                    : 'Ошибка обновления сайта';
            return rejectWithValue(errorMessage);
        }
    },
);

export const deleteSite = createAsyncThunk(
    'sites/deleteSite',
    async (
        { siteId, organizationId }: { siteId: number; organizationId: number },
        { rejectWithValue },
    ) => {
        try {
            await apiClient.delete(
                `/organizations/${organizationId}/sites/${siteId}`,
            );
            return siteId;
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message || 'Ошибка удаления сайта'
                    : 'Ошибка удаления сайта';
            return rejectWithValue(errorMessage);
        }
    },
);

export const uploadMedia = createAsyncThunk(
    'sites/uploadMedia',
    async (
        {
            siteId,
            file,
            onProgress,
        }: {
            siteId: number;
            file: File;
            onProgress?: (progress: number) => void;
        },
        { rejectWithValue },
    ) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('site_id', siteId.toString());

            const response = await apiClient.post<SiteMedia>(
                `/sites/${siteId}/media`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent: {
                        loaded: number;
                        total?: number;
                    }) => {
                        if (onProgress && progressEvent.total) {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) /
                                    progressEvent.total,
                            );
                            onProgress(progress);
                        }
                    },
                },
            );
            return response.data;
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message || 'Ошибка загрузки медиа'
                    : 'Ошибка загрузки медиа';
            return rejectWithValue(errorMessage);
        }
    },
);

// Slice
const sitesSlice = createSlice({
    name: 'sites',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentSite: (state, action: PayloadAction<Site | null>) => {
            state.currentSite = action.payload;
        },
        setUploadProgress: (state, action: PayloadAction<number>) => {
            state.uploadProgress = action.payload;
        },
        addMediaToCurrentSite: (state, action: PayloadAction<SiteMedia>) => {
            if (state.currentSite) {
                state.currentSite.media.push(action.payload);
            }
        },
        removeMediaFromCurrentSite: (state, action: PayloadAction<string>) => {
            if (state.currentSite) {
                state.currentSite.media = state.currentSite.media.filter(
                    (media) => media.id !== action.payload,
                );
            }
        },
        updateCurrentSiteTheme: (
            state,
            action: PayloadAction<Partial<SiteTheme>>,
        ) => {
            if (state.currentSite) {
                state.currentSite.theme = {
                    ...state.currentSite.theme,
                    ...action.payload,
                };
            }
        },
        updateCurrentSiteSeo: (
            state,
            action: PayloadAction<Partial<SiteSeo>>,
        ) => {
            if (state.currentSite) {
                state.currentSite.seo = {
                    ...state.currentSite.seo,
                    ...action.payload,
                };
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch Sites
        builder
            .addCase(fetchSites.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSites.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sites = action.payload;
                state.error = null;
            })
            .addCase(fetchSites.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Create Site
        builder
            .addCase(createSite.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createSite.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sites.push(action.payload);
                state.currentSite = action.payload;
                state.error = null;
            })
            .addCase(createSite.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update Site
        builder
            .addCase(updateSite.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateSite.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.sites.findIndex(
                    (site) => site.id === action.payload.id,
                );
                if (index !== -1) {
                    state.sites[index] = action.payload;
                }
                if (state.currentSite?.id === action.payload.id) {
                    state.currentSite = action.payload;
                }
                state.error = null;
            })
            .addCase(updateSite.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete Site
        builder
            .addCase(deleteSite.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteSite.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sites = state.sites.filter(
                    (site) => site.id !== action.payload,
                );
                if (state.currentSite?.id === action.payload) {
                    state.currentSite = null;
                }
                state.error = null;
            })
            .addCase(deleteSite.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Upload Media
        builder
            .addCase(uploadMedia.pending, (state) => {
                state.isUploading = true;
                state.uploadProgress = 0;
                state.error = null;
            })
            .addCase(uploadMedia.fulfilled, (state, action) => {
                state.isUploading = false;
                state.uploadProgress = 100;
                if (state.currentSite) {
                    state.currentSite.media.push(action.payload);
                }
                state.error = null;
            })
            .addCase(uploadMedia.rejected, (state, action) => {
                state.isUploading = false;
                state.uploadProgress = 0;
                state.error = action.payload as string;
            });
    },
});

export const {
    clearError,
    setCurrentSite,
    setUploadProgress,
    addMediaToCurrentSite,
    removeMediaFromCurrentSite,
    updateCurrentSiteTheme,
    updateCurrentSiteSeo,
} = sitesSlice.actions;

export default sitesSlice.reducer;

import { useAppDispatch, useAppSelector } from '@/store';
import type { Site, SiteSeo, SiteTheme } from '@/store/slices/sitesSlice';
import {
    clearError,
    createSite,
    deleteSite,
    fetchSites,
    removeMediaFromCurrentSite,
    setCurrentSite,
    updateCurrentSiteSeo,
    updateCurrentSiteTheme,
    updateSite,
    uploadMedia,
} from '@/store/slices/sitesSlice';
import { useCallback } from 'react';

export const useSites = () => {
    const dispatch = useAppDispatch();
    const {
        sites,
        currentSite,
        isLoading,
        error,
        uploadProgress,
        isUploading,
    } = useAppSelector((state) => state.sites);

    const loadSites = useCallback(
        (organizationId: number) => {
            return dispatch(fetchSites(organizationId));
        },
        [dispatch],
    );

    const createNewSite = useCallback(
        (siteData: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => {
            return dispatch(createSite(siteData));
        },
        [dispatch],
    );

    const updateSiteData = useCallback(
        (siteId: number, organizationId: number, updates: Partial<Site>) => {
            return dispatch(updateSite({ siteId, organizationId, updates }));
        },
        [dispatch],
    );

    const deleteSiteData = useCallback(
        (siteId: number, organizationId: number) => {
            return dispatch(deleteSite({ siteId, organizationId }));
        },
        [dispatch],
    );

    const selectSite = useCallback(
        (site: Site | null) => {
            dispatch(setCurrentSite(site));
        },
        [dispatch],
    );

    const clearSitesError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const uploadSiteMedia = useCallback(
        (
            siteId: number,
            file: File,
            onProgress?: (progress: number) => void,
        ) => {
            return dispatch(uploadMedia({ siteId, file, onProgress }));
        },
        [dispatch],
    );

    const removeMedia = useCallback(
        (mediaId: string) => {
            dispatch(removeMediaFromCurrentSite(mediaId));
        },
        [dispatch],
    );

    const updateTheme = useCallback(
        (themeUpdates: Partial<SiteTheme>) => {
            dispatch(updateCurrentSiteTheme(themeUpdates));
        },
        [dispatch],
    );

    const updateSeo = useCallback(
        (seoUpdates: Partial<SiteSeo>) => {
            dispatch(updateCurrentSiteSeo(seoUpdates));
        },
        [dispatch],
    );

    return {
        sites,
        currentSite,
        isLoading,
        error,
        uploadProgress,
        isUploading,
        loadSites,
        createNewSite,
        updateSiteData,
        deleteSiteData,
        selectSite,
        clearSitesError,
        uploadSiteMedia,
        removeMedia,
        updateTheme,
        updateSeo,
    };
};

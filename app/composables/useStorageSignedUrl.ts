import { getStorageSignedUrl } from '~/api/storage';

export function useStorageSignedUrl() {
  const { authenticatedApi } = useApi();
  const openingFileId = ref<string | null>(null);

  async function openFileInNewTab(fileId: string): Promise<void> {
    openingFileId.value = fileId;
    try {
      const { url } = await getStorageSignedUrl(authenticatedApi, fileId);
      if (!import.meta.client) return;
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      openingFileId.value = null;
    }
  }

  return {
    openingFileId,
    openFileInNewTab,
  };
}

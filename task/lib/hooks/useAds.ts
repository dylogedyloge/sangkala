import { useQuery } from '@tanstack/react-query'
import { adsApi, Ad } from '@/lib/api/ads'

export const adsKeys = {
  all: ['ads'] as const,
  lists: () => [...adsKeys.all, 'list'] as const,
  list: (filters: string) => [...adsKeys.lists(), { filters }] as const,
  details: () => [...adsKeys.all, 'detail'] as const,
  detail: (id: string) => [...adsKeys.details(), id] as const,
}

export function useAds() {
  return useQuery({
    queryKey: adsKeys.lists(),
    queryFn: adsApi.getAll,
  })
}

export function useAd(id: string) {
  return useQuery({
    queryKey: adsKeys.detail(id),
    queryFn: () => adsApi.getById(id),
  })
}
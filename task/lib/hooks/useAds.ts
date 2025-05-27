import { useQuery } from '@tanstack/react-query'
import { adsApi, Ad } from '@/lib/api/ads'

export const adsKeys = {
  all: ['ads'] as const,
  lists: () => [...adsKeys.all, 'list'] as const,
  list: (filters: string) => [...adsKeys.lists(), { filters }] as const,
  details: () => [...adsKeys.all, 'detail'] as const,
  detail: (id: string) => [...adsKeys.details(), id] as const,
}

export function useAds(page: number = 1, limit: number = 9) {
  return useQuery({
    queryKey: [...adsKeys.lists(), { page, limit }],
    queryFn: () => adsApi.getAll({ limit, skip: (page - 1) * limit }),
  })
}

export function useAd(id: string) {
  return useQuery({
    queryKey: adsKeys.detail(id),
    queryFn: () => adsApi.getById(id),
  })
}
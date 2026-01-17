import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesApi } from '../services/api';
import type { ArticleFilters } from '../types';

export function useArticles(filters?: ArticleFilters) {
  return useQuery({
    queryKey: ['articles', filters],
    queryFn: () => articlesApi.list(filters),
  });
}

export function useArticle(id: number) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: () => articlesApi.get(id),
    enabled: !!id,
  });
}

export function useSearchArticles(query: string) {
  return useQuery({
    queryKey: ['articles', 'search', query],
    queryFn: () => articlesApi.search(query),
    enabled: query.length > 0,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => articlesApi.create(url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: { is_read?: boolean; is_archived?: boolean } }) =>
      articlesApi.update(id, updates),
    onSuccess: (updatedArticle) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.setQueryData(['article', updatedArticle.id], updatedArticle);
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => articlesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

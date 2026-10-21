import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QUERY_PARAM } from '@/core/routing/referencePath';

const NO_QUERY = '';

/**
 * The search as the player typed it, kept in the address so it survives a reload. Each change
 * replaces the history entry, so Back still leaves the Quick reference in one step, and keeps the
 * navigation state, which holds the screen underneath.
 */
export const useReferenceQuery = (): [query: string, setQuery: (next: string) => void] => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get(QUERY_PARAM) ?? NO_QUERY;
  const { state } = location;

  const setQuery = useCallback(
    (next: string) => {
      const params = new URLSearchParams();

      if (next !== NO_QUERY) {
        params.set(QUERY_PARAM, next);
      }

      const search = params.toString();

      navigate({ search: search ? `?${search}` : NO_QUERY }, { replace: true, state });
    },
    [navigate, state],
  );

  return [query, setQuery];
};

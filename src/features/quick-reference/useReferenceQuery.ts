import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QUERY_PARAM } from "@/core/routing/referencePath";

const NO_QUERY = "";
// Long enough to write the address once per pause in typing, not once per key.
const WRITE_DELAY_MS = 250;

const searchFor = (query: string): string => {
  const params = new URLSearchParams();

  if (query !== NO_QUERY) {
    params.set(QUERY_PARAM, query);
  }

  const search = params.toString();

  return search ? `?${search}` : NO_QUERY;
};

/**
 * The search as the player types it, kept in the field's own state so no key is lost, and
 * written to the address after a pause so it survives a reload. Each write replaces the history
 * entry, so Back still leaves the Quick reference in one step, and keeps the navigation state,
 * which holds the screen underneath.
 */
export const useReferenceQuery = (): [
  query: string,
  setQuery: (next: string) => void,
] => {
  const location = useLocation();
  const navigate = useNavigate();
  const addressQuery =
    new URLSearchParams(location.search).get(QUERY_PARAM) ?? NO_QUERY;
  const [query, setQuery] = useState(addressQuery);
  const { state } = location;

  useEffect(() => {
    if (query === addressQuery) {
      return;
    }

    const timer = setTimeout(() => {
      navigate({ search: searchFor(query) }, { replace: true, state });
    }, WRITE_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [query, addressQuery, navigate, state]);

  return [query, setQuery];
};

import { useEffect, useState } from "react";

// Loads data whenever `key` changes. `loading` is true until the response for the current key arrives.
export function useLoad(loader, key) {
  const [state, setState] = useState({ key: null, data: null, error: "" });

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((data) => {
        if (!cancelled) setState({ key, data, error: "" });
      })
      .catch((e) => {
        if (!cancelled) setState({ key, data: null, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data: state.data, error: state.error, loading: state.key !== key };
}

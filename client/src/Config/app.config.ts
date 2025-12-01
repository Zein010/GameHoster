function determineBackendUrl() {
  const vite_domain_routing = import.meta.env.VITE_DOMAIN_ROUTING;
  if (!vite_domain_routing) return  import.meta.env.VITE_API;

  const routing = Object.fromEntries(
    vite_domain_routing.split(',').map((pair:String) => {
      const [domain, backend] = pair.split('>');
      return [domain.trim(), backend.trim()];
    })
  );

  const currentDomain = window.location.hostname;
  return routing[currentDomain] || null;
}

export const API_BASE_URL = determineBackendUrl();
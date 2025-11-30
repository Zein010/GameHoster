type StringStringMap = {
  [key: string]: string;
};
const BACKEND_MAP:StringStringMap = {
  '1.localhost': 'http://localhost:8080',
  '2.localhost': 'http://localhost:8080',
  'localhost': 'http://localhost:8080',
  'default': 'http://localhost:8080',
};

function determineBackendUrl() {
  const currentDomain = window.location.hostname;
  
  if (BACKEND_MAP[currentDomain]) {
    return BACKEND_MAP[currentDomain];
  }
  
  // Return the default URL if no specific domain is matched
  return BACKEND_MAP.default;
}

// Export the final, resolved constant
export const API_BASE_URL = determineBackendUrl();
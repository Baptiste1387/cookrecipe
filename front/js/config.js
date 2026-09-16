const configuredApiUrl = new URLSearchParams(window.location.search).get('api');

export const API_BASE_URL = configuredApiUrl
    || (window.location.protocol === 'file:'
        ? 'http://localhost:8000'
        : window.location.origin);
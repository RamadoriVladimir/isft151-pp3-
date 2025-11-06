class ApiConfig {
    constructor() {
        this.protocol = window.location.protocol;
        this.host = window.location.hostname;
        this.port = window.location.port || (this.protocol === 'https:' ? '443' : '80');
       
        this.apiPort = this.port;
        this.baseURL = `${this.protocol}//${this.host}:${this.apiPort}`;
        
        this.wsProtocol = this.protocol === 'https:' ? 'wss:' : 'ws:';
        this.wsURL = `${this.wsProtocol}//${this.host}:${this.apiPort}/ws`;
    }

    getApiUrl(endpoint) {
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${this.baseURL}${normalizedEndpoint}`;
    }

    getWebSocketUrl(token) {
        return `${this.wsURL}?token=${encodeURIComponent(token)}`;
    }

    async fetch(endpoint, options = {}) {
        const url = this.getApiUrl(endpoint);
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        return fetch(url, config);
    }
}

const apiConfig = new ApiConfig();
export default apiConfig;
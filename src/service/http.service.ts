// Generic HTTP Service
export interface HttpRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string>
  timeout?: number
}

export interface HttpResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

export class HttpService {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, "") // Remove trailing slash
    this.defaultHeaders = defaultHeaders
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    return url.toString()
  }

  private async makeRequest<T>(
    endpoint: string,
    options: HttpRequestOptions = {},
  ): Promise<HttpResponse<T>> {
    const {
      method = "GET",
      headers = {},
      body,
      params,
      timeout = 30000,
    } = options

    const url = this.buildUrl(endpoint, params)
    const mergedHeaders = { ...this.defaultHeaders, ...headers }

    // Add Content-Type for POST/PUT requests with body
    if (body && !mergedHeaders["Content-Type"]) {
      mergedHeaders["Content-Type"] = "application/json"
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: mergedHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      let data: T
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        data = (await response.text()) as any
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      }
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  async get<T>(
    endpoint: string,
    options: Omit<HttpRequestOptions, "method"> = {},
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(
    endpoint: string,
    body?: any,
    options: Omit<HttpRequestOptions, "method" | "body"> = {},
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: "POST", body })
  }

  async put<T>(
    endpoint: string,
    body?: any,
    options: Omit<HttpRequestOptions, "method" | "body"> = {},
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: "PUT", body })
  }

  async delete<T>(
    endpoint: string,
    options: Omit<HttpRequestOptions, "method"> = {},
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: "DELETE" })
  }

  async patch<T>(
    endpoint: string,
    body?: any,
    options: Omit<HttpRequestOptions, "method" | "body"> = {},
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: "PATCH", body })
  }

  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value
  }

  removeDefaultHeader(key: string): void {
    delete this.defaultHeaders[key]
  }
}

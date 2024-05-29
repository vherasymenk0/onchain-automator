import axios, { AxiosRequestConfig, AxiosError } from 'axios'
import axiosRetry from 'axios-retry'

type Handler = <TData>(url: string, config?: AxiosRequestConfig) => Promise<TData>
type Props = {
  config?: AxiosRequestConfig
  proxyString?: string | null
}

export class Axios {
  private readonly instance

  constructor(props?: Props) {
    this.instance = axios.create({
      baseURL: props?.config?.baseURL,
      headers: {
        Accept: '*/*',
        ...props?.config?.headers,
      },
      timeout: 1000 * 150,
    })

    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const isAxiosError = error instanceof AxiosError
        if (!isAxiosError) throw new Error(String(error))

        const errorInfo = error?.response?.data?.error

        if (errorInfo) throw new Error(`api_message: ${errorInfo}`)

        axiosRetry(this.instance, {
          retries: 10,
          retryDelay: (...arg) => axiosRetry.exponentialDelay(...arg, 3000),
          retryCondition(e) {
            const { ERR_NETWORK, ETIMEDOUT, ECONNABORTED, ERR_CANCELED } = AxiosError
            const serverErrors = [ERR_NETWORK, ETIMEDOUT, ECONNABORTED, ERR_CANCELED]
            if (e.code && serverErrors.includes(e.code)) return true

            const statusCode = e?.response?.status
            if (!statusCode) return false

            const retryErrorCodes = [408, 429, 502, 503, 504]
            return retryErrorCodes.includes(statusCode)
          },
        })

        if (error.code === AxiosError.ECONNABORTED) {
          axiosRetry(this.instance, {
            retries: 3,

            retryDelay: (...arg) => axiosRetry.exponentialDelay(...arg, 3000),
            retryCondition(e) {
              const statusCode = e?.response?.status
              if (!statusCode) return false

              const retryErrorCodes = [429, 502, 503, 504]
              return retryErrorCodes.includes(statusCode)
            },
          })
        }

        throw new Error(error.message)
      },
    )
  }

  async makeRequest(method: string, url: string, options: AxiosRequestConfig = {}) {
    try {
      const resp = await this.instance({
        ...options,
        method,
        url,
      })
      return resp?.data
    } catch (error) {
      return await Promise.reject(error)
    }
  }

  setAuthToken(auth_token?: string) {
    if (auth_token) this.instance.defaults.headers.common.Authorization = `Bearer ${auth_token}`
    else delete this.instance.defaults.headers.common.Authorization
  }

  get: Handler = (url, axConfig) => this.makeRequest('get', url, axConfig)
  post: Handler = (url, axConfig) => this.makeRequest('post', url, axConfig)
}

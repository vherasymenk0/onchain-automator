import { config } from '~/config'

export const BOT_MASTER_AXIOS_CONFIG = {
  baseURL: `https://${config.info.api}`,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'uk,en-GB;q=0.9,en;q=0.8',
    Origin: config.info.origin,
    Referer: `${config.info.origin}/`,
    Priority: 'u=1, i',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
  },
}

export const API_MAP = {
  login: '/validate',
  info: '/info',
  tap: '/klick/myself/click',
  restoreEnergy: '/boosts/energy',
} as const

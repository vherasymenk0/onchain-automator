import { getEnvVar } from '~/helpers'

const settings = {
  api_id: Number(getEnvVar('API_ID')),
  api_hash: getEnvVar('API_HASH'),
  min_energy: 200,
  taps_count_range: [100, 199],
  sleep_between_taps: [5, 8],
  sleep_by_min_energy: [250, 400],
}

export const config = {
  settings,
  info: {
    origin: 'https://db4.onchaincoin.io',
    api: 'db4.onchaincoin.io/api',
    name: 'Chain game',
    userName: 'onchaincoin_bot',
  },
}

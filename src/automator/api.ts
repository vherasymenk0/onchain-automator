import { Axios } from '~/services'
import { API_MAP } from './constants'
import { InfoModel, LoginResponseModel, TapModel } from '~/automator/interfaces'

class ApiService {
  async login(axios: Axios, tgWebData: string) {
    try {
      axios.setAuthToken()

      const dto = { hash: tgWebData }
      const { token } = await axios.post<LoginResponseModel>(API_MAP.login, {
        data: dto,
      })

      axios.setAuthToken(token)
    } catch (e) {
      throw new Error(`Api | login() | ${e}`)
    }
  }

  async getProfileInfo(axios: Axios) {
    try {
      const res = await axios.get<InfoModel>(API_MAP.info)
      return res
    } catch (e) {
      throw new Error(`Api | getProfileInfo() | ${e}`)
    }
  }

  async sendTaps(axios: Axios, count: number) {
    try {
      const dto = { clicks: count }
      const res = await axios.post<TapModel>(API_MAP.tap, { data: dto })
      return res
    } catch (e) {
      throw new Error(`Api | sendTaps(${count}) | ${e}`)
    }
  }

  async restoreEnergy(axios: Axios) {
    try {
      const res = await axios.post<InfoModel>(API_MAP.restoreEnergy, { data: {} })
      return res
    } catch (e) {
      throw new Error(`Api | restoreEnergy() | ${e}`)
    }
  }
}

export const Api = new ApiService()

import { config } from '~/config'
import { Axios, log, Proxy, TGClient } from '~/services'
import { AutomatorState, UpdateProps } from './interfaces'
import { AccountModel } from '~/interfaces'
import { BOT_MASTER_AXIOS_CONFIG } from './constants'
import { Api } from './api'
import { time, wait } from '~/utils'
import { ONE_HOUR_TIMESTAMP } from '~/constants'
import { FloodWaitError } from 'telegram/errors'
import { AxiosRequestConfig } from 'axios'
import { getRandomRangeNumber } from '~/helpers'

const { taps_count_range, min_energy, sleep_between_taps, sleep_by_min_energy } = config.settings

export class Automator extends TGClient {
  private tokenCreatedTime = 0
  private state: AutomatorState = {
    energy: 0,
    hasEnergyRestorer: false,
    balance: 0,
    availableTaps: 0,
  }
  private isStateInit = false
  private readonly ax: Axios

  constructor(props: AccountModel) {
    super(props)
    const { headers, baseURL } = BOT_MASTER_AXIOS_CONFIG
    let axiosConfig: AxiosRequestConfig = { baseURL, headers: { ...headers, ...props.agent } }

    if (this.client?.proxyString) {
      const agent = Proxy.getAgent(this.client.proxyString)
      axiosConfig.httpsAgent = agent
      axiosConfig.httpAgent = agent
    }

    this.ax = new Axios({
      config: axiosConfig,
      proxyString: props.proxyString,
    })
  }

  private updateState(info: UpdateProps) {
    this.state = {
      ...this.state,
      energy: info.energy,
      balance: info.coins,
      availableTaps: info.clicks,
    }

    if (info?.dailyEnergyRefill) this.state.hasEnergyRestorer = info.dailyEnergyRefill > 0
    this.isStateInit = true
  }

  private async auth(tgWebData: string) {
    await Api.login(this.ax, tgWebData)
    this.tokenCreatedTime = time()
    log.success('Successfully authenticated', this.client.name)
  }

  private async setProfileInfo() {
    const data = await Api.getProfileInfo(this.ax)
    const { coins, energy, clicks } = data.user
    this.updateState(data.user)
    log.info(
      `Balance: ${coins} | Total clicked coins: ${clicks} | Energy: ${energy}`,
      this.client.name,
    )
  }

  private async sendTaps() {
    const [min, max] = taps_count_range
    const tapsCount = getRandomRangeNumber(min, max)

    const data = await Api.sendTaps(this.ax, tapsCount)
    this.updateState(data)
    log.success(`Successfully tapped! (+${tapsCount}) | Balance: ${data.coins}`, this.client.name)
    return data
  }

  private async restoreEnergy() {
    const { user } = await Api.restoreEnergy(this.ax)
    this.updateState(user)
    log.success(`Energy restored Successfully! | Energy: ${user.energy}`, this.client.name)
  }

  async start() {
    try {
      const { proxyString, name } = this.client
      if (proxyString) await Proxy.check(proxyString, name)
      await wait()
      const tgWebData = await this.getTgWebData()
      await wait()

      while (true) {
        const { energy, hasEnergyRestorer } = this.state

        const isTokenExpired = time() - this.tokenCreatedTime >= ONE_HOUR_TIMESTAMP

        try {
          if (isTokenExpired) {
            await this.auth(tgWebData)
            await wait()
            continue
          }

          if (!this.isStateInit) {
            await this.setProfileInfo()
            await wait()
            continue
          }

          if (energy >= min_energy) {
            const [min, max] = sleep_between_taps
            const sleepTime = getRandomRangeNumber(min, max)

            await this.sendTaps()
            log.info(`Sleep between clicks ${sleepTime}`, this.client.name)
            await wait(sleepTime)
            continue
          }

          if (hasEnergyRestorer) {
            await this.restoreEnergy()
            await wait()
            continue
          }

          const [min, max] = sleep_by_min_energy
          const sleepTime = getRandomRangeNumber(min, max)
          log.warn(
            `Minimum energy reached, sleep ${sleepTime}s | Energy: ${energy}`,
            this.client.name,
          )
          await wait(sleepTime)
        } catch (e) {
          log.error(String(e), this.client.name)
          await wait(30)
        }
      }
    } catch (error) {
      if (error instanceof FloodWaitError) {
        log.error(String(error), this.client.name)
        log.warn(`Sleep ${error.seconds} seconds`, this.client.name)
        await wait(error.seconds)
      }
      await wait(10)
    }
  }
}

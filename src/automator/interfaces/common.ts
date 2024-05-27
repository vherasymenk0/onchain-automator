import { InfoModel } from '~/automator/interfaces/models'

export interface AutomatorState {
  energy: number
  hasEnergyRestorer: boolean
  balance: number
  availableTaps: number
}

export interface UpdateProps extends Pick<InfoModel['user'], 'energy' | 'clicks' | 'coins'> {
  dailyEnergyRefill?: number
}

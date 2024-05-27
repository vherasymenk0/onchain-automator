export interface LoginResponseModel {
  success: boolean
  token: string
}

export interface InfoModel {
  user: {
    _id: string
    tgId: number
    energy: number
    maxEnergy: number
    league: number
    fullName: string
    clicks: number
    coins: number
    energyLevel: number
    clickLevel: number
    dailyEnergyRefill: number
    dailyClickBoosts: number
    maxClickBoost: number
    hasDisbeliever: boolean
    isAdmin: boolean
    isBanned: boolean
    isFirstTime: boolean
    referals: number
    inSquad: boolean
    gems: number
    quests: {
      tgChannel: boolean
      twitter: boolean
      trustWallet: boolean
      okx: boolean
    }
  }
  success: boolean
}

export interface TapModel {
  clicks: number
  energy: number
  coins: number
  hasBoost: boolean
}

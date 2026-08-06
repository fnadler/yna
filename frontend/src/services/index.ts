const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export const inviteService = {
  validate: async (token: string): Promise<{ valid: boolean; expired?: boolean; used?: boolean }> => {
    await delay(rand(300, 600))
    if (token === 'expired') return { valid: false, expired: true }
    if (token === 'used') return { valid: false, used: true }
    if (token === 'invalid') return { valid: false }
    return { valid: true }
  },
}

import Keyv from "keyv"
import KeyvRedis from "@keyv/redis"

export const cache = process.env.REDIS_URL
  ? new Keyv({
      store: new KeyvRedis(process.env.REDIS_URL),
      ttl: 1000 * 60 * 5, // 5 phút
    })
  : new Keyv({
      ttl: 1000 * 60 * 5,
    })

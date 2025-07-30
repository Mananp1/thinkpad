import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import dotenv from "dotenv";

dotenv.config();

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
<<<<<<< HEAD
  limiter: Ratelimit.slidingWindow(5, "20 s"),
=======
  limiter: Ratelimit.slidingWindow(10, "30 s"),
>>>>>>> 884855a (New Features)
});

export default ratelimit;

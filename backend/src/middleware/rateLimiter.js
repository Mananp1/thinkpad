import ratelimit from "../config/upstash.js";

<<<<<<< HEAD
const rateLimiter = async (req, res, next) => {
  try {
    const { success } = await ratelimit.limit("my-limit-key");

    if (!success) {
      return res.status(429).json({
        message: "Too many requests, please try again later",
      });
    }
    next();
  } catch (error) {
    console.log("Rate limit error", error);
    next(error);
  }
};

export default rateLimiter;
=======
export default async function rateLimiter(req, res, next) {
  try {
    if (req.method === "OPTIONS") return next();

    const id = req.ip;

    const { success, limit, remaining, reset } = await ratelimit.limit(id);

    res.setHeader("X-RateLimit-Limit", String(limit ?? 10));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, remaining ?? 0)));
    if (reset)
      res.setHeader("X-RateLimit-Reset", String(Math.ceil(reset / 1000)));

    if (!success) {
      return res
        .status(429)
        .json({ message: "Too many requests, please try again later" });
    }
    return next();
  } catch (error) {
    console.log("Rate limit error", error);
    return next(error);
  }
}
>>>>>>> 884855a (New Features)

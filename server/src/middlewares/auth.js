import { getAuth } from '@clerk/express';

export const requireAuth = (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    
    // Attach the verified ID to the request object for convenience down the line
    req.userId = userId;
    next();
  } catch (error) {
    console.error("Authentication Middleware Error:", error);
    return res.status(401).json({ error: "Unauthorized access token" });
  }
};
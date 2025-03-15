import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { 
  insertUserSchema, 
  loginSchema, 
  transferSchema, 
  depositSchema, 
  withdrawalSchema,
  updateProfileSchema,
  changePasswordSchema 
} from "@shared/schema";
import { createSessionStore } from "./session";
import { ZodError } from "zod";

// Helper for handling errors
const handleError = (res: Response, error: unknown) => {
  console.error(error);
  if (error instanceof ZodError) {
    return res.status(400).json({ 
      message: "Validation error", 
      errors: error.errors 
    });
  }
  return res.status(500).json({ message: "Internal server error" });
};

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup session
  const sessionStore = createSessionStore(session);
  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "secure-banking-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // AUTHENTICATION ROUTES

  // Register new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Create new user
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Set user in session
      req.session.user = userWithoutPassword;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      return handleError(res, error);
    }
  });

  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      // Validate credentials
      const user = await storage.validateUserPassword(
        loginData.email, 
        loginData.password
      );
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Set user in session
      req.session.user = userWithoutPassword;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return handleError(res, error);
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", isAuthenticated, (req: Request, res: Response) => {
    return res.status(200).json(req.session.user);
  });

  // ACCOUNT ROUTES

  // Get user accounts
  app.get("/api/accounts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      const accounts = await storage.getAccountsByUserId(userId);
      return res.status(200).json(accounts);
    } catch (error) {
      return handleError(res, error);
    }
  });

  // TRANSACTION ROUTES

  // Get user transactions
  app.get("/api/transactions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      const transactions = await storage.getTransactionsByUserId(userId);
      return res.status(200).json(transactions);
    } catch (error) {
      return handleError(res, error);
    }
  });

  // Transfer money
  app.post("/api/transactions/transfer", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      const transferData = transferSchema.parse(req.body);
      
      // Get accounts and check ownership
      const fromAccount = await storage.getAccountById(transferData.fromAccountId);
      const toAccount = await storage.getAccountById(transferData.toAccountId);
      
      if (!fromAccount || fromAccount.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access this account" });
      }
      
      if (!toAccount) {
        return res.status(404).json({ message: "Destination account not found" });
      }
      
      // Check sufficient balance
      const amount = parseFloat(transferData.amount);
      if (parseFloat(fromAccount.balance.toString()) < amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // Update account balances
      await storage.updateAccountBalance(fromAccount.id, -amount);
      await storage.updateAccountBalance(toAccount.id, amount);
      
      // Create transaction records
      const fromTransaction = await storage.createTransaction({
        userId,
        accountId: fromAccount.id,
        type: "transfer",
        amount: -amount,
        description: transferData.description,
        toAccountId: toAccount.id
      });
      
      await storage.createTransaction({
        userId: toAccount.userId,
        accountId: toAccount.id,
        type: "transfer",
        amount: amount,
        description: `Transfer from account ${fromAccount.accountNumber}`,
        toAccountId: null
      });
      
      return res.status(200).json(fromTransaction);
    } catch (error) {
      return handleError(res, error);
    }
  });

  // Deposit money
  app.post("/api/transactions/deposit", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      const depositData = depositSchema.parse(req.body);
      
      // Get account and check ownership
      const account = await storage.getAccountById(depositData.accountId);
      
      if (!account || account.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access this account" });
      }
      
      // Update account balance
      const amount = parseFloat(depositData.amount);
      await storage.updateAccountBalance(account.id, amount);
      
      // Create transaction record
      const transaction = await storage.createTransaction({
        userId,
        accountId: account.id,
        type: "deposit",
        amount: amount,
        description: depositData.description,
        toAccountId: null
      });
      
      return res.status(200).json(transaction);
    } catch (error) {
      return handleError(res, error);
    }
  });

  // Withdraw money
  app.post("/api/transactions/withdrawal", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      const withdrawalData = withdrawalSchema.parse(req.body);
      
      // Get account and check ownership
      const account = await storage.getAccountById(withdrawalData.accountId);
      
      if (!account || account.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access this account" });
      }
      
      // Check sufficient balance (except for credit accounts)
      const amount = parseFloat(withdrawalData.amount);
      if (account.type !== "credit" && parseFloat(account.balance.toString()) < amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // Update account balance
      await storage.updateAccountBalance(account.id, -amount);
      
      // Create transaction record
      const transaction = await storage.createTransaction({
        userId,
        accountId: account.id,
        type: "withdrawal",
        amount: -amount,
        description: withdrawalData.description,
        toAccountId: null
      });
      
      return res.status(200).json(transaction);
    } catch (error) {
      return handleError(res, error);
    }
  });

  // USER PROFILE ROUTES

  // Update user profile
  app.put("/api/profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      const profileData = updateProfileSchema.parse(req.body);
      
      // Update user
      const updatedUser = await storage.updateUser(userId, profileData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      // Update session
      req.session.user = userWithoutPassword;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return handleError(res, error);
    }
  });

  // Change password
  app.put("/api/profile/password", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      const passwordData = changePasswordSchema.parse(req.body);
      
      // Get user
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      if (user.password !== passwordData.currentPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Update password
      await storage.updateUser(userId, { password: passwordData.newPassword });
      
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      return handleError(res, error);
    }
  });

  return httpServer;
}

function createSessionStore(session: any) {
  const MemoryStore = session.MemoryStore;
  return new MemoryStore();
}

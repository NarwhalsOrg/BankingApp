import { 
  User, InsertUser, Account, InsertAccount, Transaction, InsertTransaction
} from "@shared/schema";
import { randomBytes } from "crypto";

// Storage interface
export interface IStorage {
  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  validateUserPassword(email: string, password: string): Promise<User | undefined>;

  // Account methods
  createAccount(account: InsertAccount): Promise<Account>;
  getAccountById(id: number): Promise<Account | undefined>;
  getAccountsByUserId(userId: number): Promise<Account[]>;
  updateAccountBalance(id: number, amount: number): Promise<Account | undefined>;

  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getTransactionsByAccountId(accountId: number): Promise<Transaction[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private accounts: Map<number, Account>;
  private transactions: Map<number, Transaction>;
  private userIdCounter: number;
  private accountIdCounter: number;
  private transactionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.accounts = new Map();
    this.transactions = new Map();
    this.userIdCounter = 1;
    this.accountIdCounter = 1;
    this.transactionIdCounter = 1;
  }

  // User methods
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...userData, id };
    this.users.set(id, user);

    // Create default accounts for new user
    this.createAccount({
      userId: id,
      type: "checking",
      accountNumber: this.generateAccountNumber(),
      balance: 2500.00
    });

    this.createAccount({
      userId: id,
      type: "savings",
      accountNumber: this.generateAccountNumber(),
      balance: 10000.00
    });

    this.createAccount({
      userId: id,
      type: "credit",
      accountNumber: this.generateAccountNumber(),
      balance: 0.00
    });

    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async validateUserPassword(email: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return undefined;
  }

  // Account methods
  async createAccount(accountData: InsertAccount): Promise<Account> {
    const id = this.accountIdCounter++;
    const now = new Date();
    const account: Account = { 
      ...accountData, 
      id, 
      createdAt: now
    };
    this.accounts.set(id, account);
    return account;
  }

  async getAccountById(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async getAccountsByUserId(userId: number): Promise<Account[]> {
    const userAccounts: Account[] = [];
    for (const account of this.accounts.values()) {
      if (account.userId === userId) {
        userAccounts.push(account);
      }
    }
    return userAccounts;
  }

  async updateAccountBalance(id: number, amount: number): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (!account) return undefined;

    const updatedAccount = { 
      ...account, 
      balance: parseFloat(account.balance.toString()) + amount 
    };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  // Transaction methods
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const now = new Date();
    const transaction: Transaction = { 
      ...transactionData, 
      id, 
      date: now
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    const userTransactions: Transaction[] = [];
    for (const transaction of this.transactions.values()) {
      if (transaction.userId === userId) {
        userTransactions.push(transaction);
      }
    }
    return userTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getTransactionsByAccountId(accountId: number): Promise<Transaction[]> {
    const accountTransactions: Transaction[] = [];
    for (const transaction of this.transactions.values()) {
      if (transaction.accountId === accountId) {
        accountTransactions.push(transaction);
      }
    }
    return accountTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Helper methods
  private generateAccountNumber(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }
}

// Create and export storage instance
export const storage = new MemStorage();

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import TransactionTable from "@/components/transaction-table";

export default function Transactions() {
  const [filter, setFilter] = useState({
    account: "all",
    type: "all",
    search: "",
  });

  // Fetch accounts
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["/api/accounts"],
  });

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const getAccountById = (id: number) => {
    if (!accounts) return null;
    return accounts.find((account: any) => account.id === id);
  };

  const resetFilters = () => {
    setFilter({
      account: "all",
      type: "all",
      search: "",
    });
  };

  // Filter transactions
  const getFilteredTransactions = () => {
    if (!transactions) return [];

    return transactions.filter((tx: any) => {
      // Filter by account
      if (filter.account !== "all") {
        const account = getAccountById(tx.accountId);
        if (!account || account.type !== filter.account) {
          return false;
        }
      }

      // Filter by type
      if (filter.type !== "all" && tx.type !== filter.type) {
        return false;
      }

      // Filter by search
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        if (!tx.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  };

  // Format currency helper
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(typeof amount === "string" ? parseFloat(amount) : amount);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Get account type display name
  const getAccountTypeDisplay = (accountType: string) => {
    const types: Record<string, string> = {
      checking: "Checking Account",
      savings: "Savings Account",
      credit: "Credit Card",
    };
    return types[accountType] || accountType;
  };

  // Loading state
  if (accountsLoading || transactionsLoading) {
    return (
      <Card className="animate-pulse">
        <div className="p-6 h-96"></div>
      </Card>
    );
  }

  const filteredTransactions = getFilteredTransactions();

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h3 className="text-lg font-medium text-neutral-900">
          Transaction History
        </h3>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <Select
            value={filter.account}
            onValueChange={(value) => setFilter({ ...filter, account: value })}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              <SelectItem value="checking">Checking</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="credit">Credit Card</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.type}
            onValueChange={(value) => setFilter({ ...filter, type: value })}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
              <SelectItem value="transfer">Transfers</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-60">
            <Input
              type="text"
              placeholder="Search transactions..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        {filteredTransactions.length > 0 ? (
          <TransactionTable
            transactions={filteredTransactions}
            accounts={accounts}
            getAccountById={getAccountById}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getAccountTypeDisplay={getAccountTypeDisplay}
          />
        ) : (
          <div className="px-6 py-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-neutral-300 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-neutral-500 text-sm">
              No transactions found matching your filters.
            </p>
            <Button onClick={resetFilters} variant="outline" className="mt-4">
              Reset filters
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import AccountCard from "@/components/account-card";
import ActionButton from "@/components/action-button";
import TransactionTable from "@/components/transaction-table";

export default function Dashboard() {
  const [, navigate] = useLocation();

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

  const goToTransfer = (type: string) => {
    navigate(`/transfer/${type}`);
  };

  const getRecentTransactions = () => {
    if (!transactions) return [];
    return transactions.slice(0, 5);
  };

  // Format currency helper
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Get account type display name
  const getAccountTypeDisplay = (accountType: string) => {
    const types: Record<string, string> = {
      checking: "Checking Account",
      savings: "Savings Account",
      credit: "Credit Card"
    };
    return types[accountType] || accountType;
  };

  // Loading state
  if (accountsLoading || transactionsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-32"></CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6 h-40"></CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardContent className="p-6 h-64"></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts && accounts.map((account: any) => (
          <AccountCard
            key={account.id}
            type={account.type}
            balance={account.balance}
            onClick={() => navigate("/transactions")}
          />
        ))}
      </div>
      
      {/* Quick Actions */}
      <Card className="overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-neutral-900">Quick Actions</h3>
        </div>
        <div className="border-t border-neutral-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionButton 
              onClick={() => goToTransfer("transfer")} 
              icon="transfer" 
              label="Transfer" 
              color="primary"
            />
            <ActionButton 
              onClick={() => goToTransfer("deposit")} 
              icon="deposit" 
              label="Deposit" 
              color="success"
            />
            <ActionButton 
              onClick={() => goToTransfer("withdrawal")} 
              icon="withdrawal" 
              label="Withdraw" 
              color="warning"
            />
            <ActionButton 
              onClick={() => navigate("/bills")} 
              icon="payment" 
              label="Pay Bills" 
              color="error"
            />
          </div>
        </div>
      </Card>
      
      {/* Recent Transactions */}
      <Card className="overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
          <h3 className="text-lg font-medium text-neutral-900">Recent Transactions</h3>
          <button
            onClick={() => navigate("/transactions")}
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            View all
          </button>
        </div>
        
        <div className="border-t border-neutral-200">
          {transactions && transactions.length > 0 ? (
            <TransactionTable
              transactions={getRecentTransactions()}
              accounts={accounts}
              getAccountById={getAccountById}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getAccountTypeDisplay={getAccountTypeDisplay}
              simplified
            />
          ) : (
            <div className="p-8 text-center">
              <p className="text-neutral-500">No transactions found.</p>
              <button
                onClick={() => goToTransfer("deposit")}
                className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
              >
                Make your first transaction
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

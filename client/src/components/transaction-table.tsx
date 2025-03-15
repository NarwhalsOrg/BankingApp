import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface TransactionTableProps {
  transactions: any[];
  accounts: any[];
  getAccountById: (id: number) => any;
  formatCurrency: (amount: number | string) => string;
  formatDate: (dateString: string) => string;
  getAccountTypeDisplay: (accountType: string) => string;
  simplified?: boolean;
}

export default function TransactionTable({
  transactions,
  accounts,
  getAccountById,
  formatCurrency,
  formatDate,
  getAccountTypeDisplay,
  simplified = false,
}: TransactionTableProps) {
  // Get transaction type badge variant
  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "deposit":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-600 hover:bg-green-100">
            {type}
          </Badge>
        );
      case "withdrawal":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-600 hover:bg-red-100">
            {type}
          </Badge>
        );
      case "transfer":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-600 hover:bg-blue-100">
            {type}
          </Badge>
        );
      case "payment":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-600 hover:bg-amber-100">
            {type}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600 hover:bg-gray-100">
            {type}
          </Badge>
        );
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-neutral-50">
          <TableRow>
            <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Date
            </TableHead>
            <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Description
            </TableHead>
            <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Account
            </TableHead>
            {!simplified && (
              <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Type
              </TableHead>
            )}
            <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const account = getAccountById(tx.accountId);
            return (
              <TableRow key={tx.id} className="hover:bg-neutral-50">
                <TableCell className="text-sm text-neutral-500">
                  {formatDate(tx.date)}
                </TableCell>
                <TableCell className="text-sm text-neutral-900">
                  {tx.description}
                </TableCell>
                <TableCell className="text-sm text-neutral-500">
                  {account ? getAccountTypeDisplay(account.type) : "Unknown"}
                </TableCell>
                {!simplified && (
                  <TableCell className="text-sm text-neutral-500">
                    {getTransactionTypeBadge(tx.type)}
                  </TableCell>
                )}
                <TableCell 
                  className={`text-sm text-right font-medium ${
                    parseFloat(tx.amount) >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(tx.amount)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

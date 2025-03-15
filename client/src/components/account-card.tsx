import { Card, CardContent } from "@/components/ui/card";

interface AccountCardProps {
  type: string;
  balance: number | string;
  onClick: () => void;
}

export default function AccountCard({ type, balance, onClick }: AccountCardProps) {
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  let icon;
  let title;
  let bgColorClass;
  let textColorClass;

  switch (type) {
    case "checking":
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      );
      title = "Checking Account";
      bgColorClass = "bg-primary-light/10";
      textColorClass = "text-primary";
      break;
    case "savings":
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
      title = "Savings Account";
      bgColorClass = "bg-green-100";
      textColorClass = "text-green-600";
      break;
    case "credit":
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
      title = "Credit Card";
      bgColorClass = "bg-amber-100";
      textColorClass = "text-amber-600";
      break;
    default:
      icon = null;
      title = "Account";
      bgColorClass = "bg-gray-100";
      textColorClass = "text-gray-600";
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${bgColorClass} rounded-full p-3`}>
              {icon}
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-neutral-500 truncate">{title}</dt>
                <dd>
                  <div className="text-lg font-semibold text-neutral-900">{formatCurrency(balance)}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-neutral-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <button 
              onClick={onClick}
              className="font-medium text-primary hover:text-primary-dark"
            >
              View transactions
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

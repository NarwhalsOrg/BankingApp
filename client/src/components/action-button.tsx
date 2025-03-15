interface ActionButtonProps {
  onClick: () => void;
  icon: "transfer" | "deposit" | "withdrawal" | "payment";
  label: string;
  color: "primary" | "success" | "warning" | "error";
}

export default function ActionButton({ onClick, icon, label, color }: ActionButtonProps) {
  let IconComponent;
  let colorClass;

  // Determine the icon to display
  switch (icon) {
    case "transfer":
      IconComponent = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
      break;
    case "deposit":
      IconComponent = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      );
      break;
    case "withdrawal":
      IconComponent = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      );
      break;
    case "payment":
      IconComponent = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
      break;
    default:
      IconComponent = null;
  }

  // Determine the color to use
  switch (color) {
    case "primary":
      colorClass = "text-primary";
      break;
    case "success":
      colorClass = "text-green-600";
      break;
    case "warning":
      colorClass = "text-amber-600";
      break;
    case "error":
      colorClass = "text-red-600";
      break;
    default:
      colorClass = "text-neutral-600";
  }

  return (
    <button
      onClick={onClick}
      className="bg-white shadow-sm rounded-lg border border-neutral-200 p-4 flex flex-col items-center hover:border-primary transition duration-150"
    >
      <span className={colorClass}>
        {IconComponent}
      </span>
      <span className="text-sm font-medium text-neutral-700">{label}</span>
    </button>
  );
}

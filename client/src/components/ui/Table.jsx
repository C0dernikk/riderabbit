import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const Table = ({ className, ...props }) => (
  <div className="w-full overflow-auto rounded-lg border border-border">
    <table className={twMerge(clsx("w-full caption-bottom text-sm", className))} {...props} />
  </div>
);

const TableHeader = ({ className, ...props }) => (
  <thead className={twMerge(clsx("[&_tr]:border-b bg-muted/50", className))} {...props} />
);

const TableBody = ({ className, ...props }) => (
  <tbody className={twMerge(clsx("[&_tr:last-child]:border-0", className))} {...props} />
);

const TableFooter = ({ className, ...props }) => (
  <tfoot className={twMerge(clsx("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className))} {...props} />
);

const TableRow = ({ className, ...props }) => (
  <tr
    className={twMerge(clsx(
      "border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    ))}
    {...props}
  />
);

const TableHead = ({ className, ...props }) => (
  <th
    className={twMerge(clsx(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    ))}
    {...props}
  />
);

const TableCell = ({ className, ...props }) => (
  <td
    className={twMerge(clsx("p-4 align-middle [&:has([role=checkbox])]:pr-0", className))}
    {...props}
  />
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
};

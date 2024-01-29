import * as React from "react";

import AlertDestructive from "@/components/Core/Error";
import { LoadingFill } from "@/components/Loading";
import { cn } from "@/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode[];
  loading?: boolean;
  error?: Error;
}

export const AdvanceCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, loading, error, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow",
        className
      )}
      {...props}
    >
      {children.filter((child, index) => {
        console.log(error);
        if (loading || error) return index < 2;
        return child;
      })}

      {loading && (
        <div className="py-12">
          <LoadingFill />
        </div>
      )}

      {error && (
        <AlertDestructive
          className="mt-2"
          title="Error"
          description={
            JSONParse(error.message)?.error ?? error.message ?? "Unknown error"
          }
        />
      )}
    </div>
  )
);
AdvanceCard.displayName = "AdvanceCard";

const JSONParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return undefined;
  }
};

export const AdvanceCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    key="title"
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
AdvanceCardTitle.displayName = "AdvanceCardTitle";

export const AdvanceCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    key="description"
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AdvanceCardDescription.displayName = "AdvanceCardDescription";

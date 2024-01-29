import {
  PinInput as RawPinInput,
  PinInputControl as RawPinInputControl,
  PinInputField as RawPinInputField,
} from "@ark-ui/react/pin-input";
import * as React from "react";

import { cn } from "@/utils/cn";

const PinInput = RawPinInput;

const PinInputControl = React.forwardRef<
  React.ElementRef<typeof RawPinInputControl>,
  React.ComponentPropsWithoutRef<typeof RawPinInputControl>
>(({ className, ...props }, ref) => (
  <RawPinInputControl
    ref={ref}
    className={cn("grid grid-flow-col gap-1 ", className)}
    {...props}
  />
));
PinInputControl.displayName = RawPinInputControl.displayName;

const PinInputField = React.forwardRef<
  React.ElementRef<typeof RawPinInputField>,
  React.ComponentPropsWithoutRef<typeof RawPinInputField>
>(({ className, ...props }, ref) => (
  <RawPinInputField
    ref={ref}
    className={cn(
      "flex h-14 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-center text-xl shadow-sm transition-colors [appearance:textfield] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
      className
    )}
    {...props}
  />
));
PinInputField.displayName = RawPinInputField.displayName;

export { PinInput, PinInputField, PinInputControl };

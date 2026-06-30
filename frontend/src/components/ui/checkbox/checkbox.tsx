import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<React.ComponentProps<"button">, "type" | "value"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

/**
 * shadcn-stilige Checkbox ohne Radix-Dependency.
 * Accessible via role="checkbox" + aria-checked; Keyboard via Space/Enter.
 */
function Checkbox({
  checked = false,
  onCheckedChange,
  className,
  disabled,
  onClick,
  ...props
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 size-5 shrink-0 cursor-pointer rounded-[0.4375rem] border transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
          : "bg-background hover:border-primary/60",
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) onCheckedChange?.(!checked);
      }}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onCheckedChange?.(!checked);
        }
      }}
      {...props}
    >
      {checked && <Check className="size-4" strokeWidth={3} />}
    </button>
  );
}

export { Checkbox };

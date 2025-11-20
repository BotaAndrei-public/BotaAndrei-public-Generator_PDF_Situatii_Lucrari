import * as React from "react";
import { cn } from "@/lib/utils";
import { BoxSelect, Check } from "lucide-react";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value, onChange, ...props }, ref) => {
    // State intern doar pentru inputul numeric
    const [internalValue, setInternalValue] = React.useState<string>(
      value != null ? value.toString() : ""
    );

    React.useEffect(() => {
      setInternalValue(value != null ? value.toString() : "");
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInternalValue(val);

      if (!onChange) return;

      if (type === "number") {
        const numeric = parseFloat(val);
        const patchedEvent = {
          ...e,
          target: {
            ...e.target,
            value: val, // string
            numericValue: isNaN(numeric) ? 0 : numeric, // numeric
          },
        };
        onChange(patchedEvent as any);
      } else {
        onChange(e);
      }
    };

    const handleFocus = () => {
      if (type === "number" && internalValue === "0") setInternalValue("");
    };

    const handleBlur = () => {
      if (type === "number" && internalValue === "") {
        setInternalValue("0");
      }
    };

    return (
      <input
        ref={ref}
        type={type}
        value={internalValue} // folosim internalValue pentru vizual
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export { Input };

"use client";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../../lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "sm" | "md";

type Props = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-500",
  secondary: "bg-transparent text-slate-500 hover:bg-slate-100",
  danger: "bg-transparent text-red-500 hover:bg-red-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-2 py-1 text-sm",
  md: "px-4 py-2 text-sm",
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "sm", className, type = "button", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center border border-transparent font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400",
        variantClasses[variant],
        sizeClasses[size],
        rest.disabled && "opacity-60",
        className
      )}
      {...rest}
    />
  );
});

export default Button;

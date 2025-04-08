import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg" | "icon";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "default",
  className,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50";

  const variants: Record<string, string> = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-800 hover:bg-gray-100",
    ghost: "text-gray-700 hover:bg-gray-100",
  };

  const sizes: Record<string, string> = {
    sm: "px-3 py-1 text-sm",
    default: "px-4 py-2",
    lg: "px-5 py-3 text-base",
    icon: "p-2 w-9 h-9", // For icon-only buttons
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        className || ""
      }`}
      {...props}
    />
  );
};

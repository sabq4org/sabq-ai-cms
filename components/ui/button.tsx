import React from 'react';
import { cva } from 'class-variance-authority';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'primary' | 'success' | 'warning' | 'danger' | 'subtle' | 'transparent';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  children?: React.ReactNode;
}

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary-dark dark:text-primary-dark-foreground dark:hover:bg-primary-dark/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-destructive-dark dark:text-destructive-dark-foreground dark:hover:bg-destructive-dark/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground dark:border-input-dark dark:bg-background-dark dark:hover:bg-accent-dark dark:hover:text-accent-dark-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-secondary-dark dark:text-secondary-dark-foreground dark:hover:bg-secondary-dark/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent-dark dark:hover:text-accent-dark-foreground",
        link: "text-primary underline-offset-4 hover:underline dark:text-primary-dark",
        primary: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800",
        success: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800",
        danger: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800",
        subtle: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
        transparent: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'default', 
  size = 'default',
  className,
  children,
  ...props 
}) => {
  const baseClasses = buttonVariants({ variant, size });
  
  return (
    <button
      className={`${baseClasses} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}; 
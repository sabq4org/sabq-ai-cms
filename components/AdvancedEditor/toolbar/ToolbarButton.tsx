'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label?: string;
  tooltip?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ToolbarButton({
  icon,
  label,
  tooltip,
  isActive = false,
  isDisabled = false,
  onClick,
  variant = 'ghost',
  size = 'sm',
  className
}: ToolbarButtonProps) {
  const buttonContent = (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'h-8 w-8 p-0 transition-all duration-200',
        isActive && 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
        isDisabled && 'opacity-50 cursor-not-allowed',
        label && 'w-auto px-3 gap-2',
        className
      )}
    >
      {icon}
      {label && <span className="text-xs font-medium">{label}</span>}
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonContent;
}

// مكون مجموعة أزرار
interface ToolbarButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ToolbarButtonGroup({ children, className }: ToolbarButtonGroupProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {children}
    </div>
  );
}

// مكون فاصل
export function ToolbarSeparator() {
  return (
    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
  );
}

// مكون قائمة منسدلة للأزرار
interface ToolbarDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ToolbarDropdown({ trigger, children, className }: ToolbarDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={cn('relative', className)}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 z-20 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[200px]">
            {children}
          </div>
        </>
      )}
    </div>
  );
}


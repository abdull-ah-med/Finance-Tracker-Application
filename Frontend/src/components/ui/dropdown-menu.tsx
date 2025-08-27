import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import './dropdown-menu.css';

interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a DropdownMenu');
  }
  return context;
}

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface DropdownMenuContentProps {
  align?: 'start' | 'center' | 'end';
  className?: string;
  children: React.ReactNode;
}

interface DropdownMenuItemProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

interface DropdownMenuLabelProps {
  className?: string;
  children: React.ReactNode;
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="dropdown-menu">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ asChild, children }: DropdownMenuTriggerProps) {
  const { setOpen } = useDropdown();
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
      onClick: (e: React.MouseEvent) => {
        const childProps = (children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>).props;
        childProps.onClick?.(e);
        setOpen(true);
      }
    });
  }
  
  return (
    <button className="dropdown-trigger" onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({ align = 'center', className = '', children }: DropdownMenuContentProps) {
  const { open, setOpen } = useDropdown();
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, setOpen]);
  
  if (!open) return null;
  
  return (
    <div 
      ref={contentRef} 
      className={`dropdown-content dropdown-content-${align} ${className}`}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ className = '', children, onClick }: DropdownMenuItemProps) {
  const { setOpen } = useDropdown();
  
  const handleClick = () => {
    onClick?.();
    setOpen(false);
  };
  
  return (
    <div className={`dropdown-item ${className}`} onClick={handleClick}>
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ className = '', children }: DropdownMenuLabelProps) {
  return (
    <div className={`dropdown-label ${className}`}>
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className = '' }: DropdownMenuSeparatorProps) {
  return <div className={`dropdown-separator ${className}`} />;
}

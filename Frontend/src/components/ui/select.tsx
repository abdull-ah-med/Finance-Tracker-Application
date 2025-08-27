import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { ChevronDown } from 'lucide-react';
import './select.css';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  placeholder?: string;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

function useSelect() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select');
  }
  return context;
}

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
  children?: React.ReactNode;
}

interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Select({ value = '', onValueChange, disabled, children }: SelectProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <SelectContext.Provider value={{ 
      value, 
      onValueChange: onValueChange || (() => {}), 
      open: disabled ? false : open, 
      setOpen: disabled ? () => {} : setOpen,
      placeholder: undefined
    }}>
      <div className={`select ${disabled ? 'select-disabled' : ''}`}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className = '', children }: SelectTriggerProps) {
  const { open, setOpen } = useSelect();
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  return (
    <button
      ref={triggerRef}
      type="button"
      className={`select-trigger ${open ? 'select-trigger-open' : ''} ${className}`}
      onClick={() => setOpen(!open)}
    >
      <span className="select-trigger-content">{children}</span>
      <ChevronDown className={`select-trigger-icon ${open ? 'select-trigger-icon-open' : ''}`} />
    </button>
  );
}

export function SelectValue({ placeholder, children }: SelectValueProps) {
  const { value } = useSelect();
  
  return (
    <span className={value ? '' : 'select-value-placeholder'}>
      {children || value || placeholder}
    </span>
  );
}

export function SelectContent({ className = '', children }: SelectContentProps) {
  const { open, setOpen } = useSelect();
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
    <div ref={contentRef} className={`select-content ${className}`}>
      {children}
    </div>
  );
}

export function SelectItem({ value, children, disabled }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setOpen } = useSelect();
  
  const handleSelect = () => {
    if (!disabled) {
      onValueChange(value);
      setOpen(false);
    }
  };
  
  return (
    <div
      className={`select-item ${selectedValue === value ? 'select-item-selected' : ''} ${disabled ? 'select-item-disabled' : ''}`}
      onClick={handleSelect}
    >
      {children}
    </div>
  );
}

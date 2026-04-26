'use client';

import React, { useState, ReactNode, createContext, useContext } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionContextType {
  isOpen: boolean;
  toggle: () => void;
  isAutoGrouped: boolean;
}

const AccordionContext = createContext<AccordionContextType>({
  isOpen: false,
  toggle: () => {},
  isAutoGrouped: false
});

export function AccordionProvider({ children, defaultOpen = false, isAutoGrouped = false, className = '' }: { children: ReactNode, defaultOpen?: boolean, isAutoGrouped?: boolean, className?: string }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={className}>
      <AccordionContext.Provider value={{ isOpen, toggle: () => setIsOpen(!isOpen), isAutoGrouped }}>
        {children}
      </AccordionContext.Provider>
    </div>
  );
}

export function AccordionToggle({ className = '' }: { className?: string }) {
  const { isOpen, toggle, isAutoGrouped } = useContext(AccordionContext);
  if (!isAutoGrouped) return null;

  return (
    <div 
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
      className={`cursor-pointer transition-transform duration-500 z-50 pointer-events-auto flex items-center justify-center p-1.5 md:p-2.5 rounded-full hover:bg-black/20 ${isOpen ? 'rotate-180 bg-black/10' : 'rotate-0'} ${className}`}
      title="Bölümü Daralt / Genişlet"
    >
      <ChevronDown className="w-5 h-5 md:w-6 md:h-6 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] text-white" strokeWidth={3} />
    </div>
  );
}

export function AccordionContent({ children }: { children: ReactNode }) {
  const { isOpen, isAutoGrouped } = useContext(AccordionContext);

  if (!isAutoGrouped) {
    return <>{children}</>;
  }

  return (
    <div 
      className={`grid transition-[grid-template-rows,opacity,transform] duration-500 ease-in-out mt-2 ${
        isOpen ? 'grid-rows-[1fr] opacity-100 translate-y-0' : 'grid-rows-[0fr] opacity-0 -translate-y-4'
      }`}
    >
      <div className="overflow-hidden p-1">
        {children}
      </div>
    </div>
  );
}

// Deprecated alias for backwards compatibility during migration (if needed)
export function CategoryAccordionWrapper({ headerNode, contentNode, ...props }: any) {
  return (
    <AccordionProvider {...props}>
      {headerNode}
      <AccordionContent>{contentNode}</AccordionContent>
    </AccordionProvider>
  );
}

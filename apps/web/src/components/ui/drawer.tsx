"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

interface DrawerContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("Drawer components must be used within a Drawer");
  }
  return context;
};

interface DrawerProps {
  children: React.ReactNode;
}

export function Drawer({ children }: DrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <DrawerContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </DrawerContext.Provider>
  );
}

interface DrawerTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function DrawerTrigger({ children, className }: DrawerTriggerProps) {
  const { setIsOpen } = useDrawer();

  return (
    <button onClick={() => setIsOpen(true)} className={cn(className)}>
      {children}
    </button>
  );
}

interface DrawerContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DrawerContent({ children, className }: DrawerContentProps) {
  const { isOpen, setIsOpen } = useDrawer();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div
        className={cn(
          "fixed bottom-3 left-0 right-0 bg-gray-900 border border-gray-800 rounded-lg z-50 max-h-[70vh] overflow-hidden w-[95%] mx-auto flex flex-col transform transition-transform",
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

interface DrawerHeaderProps {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function DrawerHeader({
  children,
  className,
  showCloseButton = true,
}: DrawerHeaderProps) {
  const { setIsOpen } = useDrawer();

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border-b border-gray-800",
        className
      )}
    >
      <div className="flex-1">{children}</div>
      {showCloseButton && (
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors ml-4"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

interface DrawerBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function DrawerBody({ children, className }: DrawerBodyProps) {
  return (
    <div className={cn("p-4 overflow-y-auto flex-1", className)}>
      {children}
    </div>
  );
}

interface DrawerFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function DrawerFooter({ children, className }: DrawerFooterProps) {
  return (
    <div className={cn("border-t border-gray-800", className)}>{children}</div>
  );
}

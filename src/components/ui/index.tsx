'use client'

import { ReactNode } from 'react';

// Loading spinner component
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <svg 
      className={`animate-spin ${sizeClasses[size]} text-white`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      ></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

// Error message component
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg 
            className="h-5 w-5 text-red-400" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{message}</h3>
        </div>
      </div>
    </div>
  );
}

// Card component for consistent styling
export function Card({ 
  children, 
  className = '' 
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

// Card header component
export function CardHeader({ 
  title, 
  subtitle 
}: { 
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
      <h2 className="text-xl font-bold text-center">{title}</h2>
      {subtitle && <p className="text-blue-100 text-sm text-center mt-1">{subtitle}</p>}
    </div>
  );
}

// Button component
export function Button({ 
  children, 
  type = 'button',
  isLoading = false,
  disabled = false,
  onClick,
  className = ''
}: { 
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" />
          <span className="ml-2">Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Fade in animation container
export function FadeIn({ 
  show, 
  children 
}: { 
  show: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
}

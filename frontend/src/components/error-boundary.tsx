'use client';

import React from 'react';

interface HydrationErrorBoundaryState {
  hasError: boolean;
}

interface HydrationErrorBoundaryProps {
  children: React.ReactNode;
}

export class HydrationErrorBoundary extends React.Component<
  HydrationErrorBoundaryProps,
  HydrationErrorBoundaryState
> {
  constructor(props: HydrationErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): HydrationErrorBoundaryState {
    // Check if this is a hydration mismatch error from browser extensions
    if (
      error.message.includes('Hydration failed') ||
      error.message.includes('hydration mismatch') ||
      error.message.includes('bis_skin_checked')
    ) {
      // Don't show error for browser extension hydration issues
      return { hasError: false };
    }

    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Only log errors that aren't related to browser extensions
    if (
      !error.message.includes('bis_skin_checked') &&
      !error.message.includes('Hydration failed')
    ) {
      console.error('Non-hydration error caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="card flex-col items-center justify-center h-full p-xl text-center" style={{ border: '1px solid var(--critical-border)' }}>
          <h2 className="text-xl font-bold mb-md" style={{ color: 'var(--critical)' }}>Component Error</h2>
          <p className="text-secondary mb-md">The operations dashboard encountered an unexpected error.</p>
          <pre className="text-xs text-left p-md bg-secondary" style={{ overflowX: 'auto', maxWidth: '100%' }}>
            {this.state.error?.message}
          </pre>
          <button 
            className="btn btn--primary mt-lg"
            onClick={() => this.setState({ hasError: false })}
          >
            Attempt Recovery
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

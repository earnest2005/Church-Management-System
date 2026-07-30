import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-bold text-rose-400 mb-2">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-4">
              An error occurred while loading this page:
            </p>
            <pre className="p-4 bg-slate-950 border border-slate-800 text-rose-300 text-xs rounded-xl overflow-x-auto text-left font-mono mb-6">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-royal-blue hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Tạo file ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface State {
  hasError: boolean;
  errorInfo: string;
}

export default class ErrorBoundary extends Component<{children: ReactNode}> {
  state: State = { hasError: false, errorInfo: '' };

  static getDerivedStateFromError(error: Error) {
    return { 
      hasError: true,
      errorInfo: `${error.name}: ${error.message}`
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700">
          <h3 className="font-bold">Lỗi hệ thống!</h3>
          <pre className="whitespace-pre-wrap">{this.state.errorInfo}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Trong App.tsx
<ErrorBoundary children={undefined}>
  {/* Các component hiện có */}
</ErrorBoundary>

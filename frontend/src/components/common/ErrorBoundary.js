import React, { Component } from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Something went wrong</h2>
            <p>We're sorry for the inconvenience. An error has occurred.</p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre className="error-stack">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="error-actions">
              <button 
                className="btn btn-primary" 
                onClick={this.handleReload}
              >
                Reload Page
              </button>
              
              {this.props.onRetry && (
                <button 
                  className="btn btn-secondary"
                  onClick={this.props.onRetry}
                >
                  Try Again
                </button>
              )}
              
              <a 
                href="/" 
                className="btn btn-link"
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

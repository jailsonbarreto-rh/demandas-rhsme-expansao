import { Component, type ReactNode } from 'react';

export interface ErrorBoundaryAction {
  label: string;
  onClick: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  title: string;
  message: string;
  variant?: 'global' | 'section';
  resetKeys?: readonly unknown[];
  onReset?: () => void;
  secondaryAction?: ErrorBoundaryAction;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

function resetKeysChanged(
  previous: readonly unknown[] = [],
  current: readonly unknown[] = [],
) {
  return previous.length !== current.length
    || previous.some((value, index) => !Object.is(value, current[index]));
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (
      this.state.hasError
      && resetKeysChanged(previousProps.resetKeys, this.props.resetKeys)
    ) {
      this.setState({ hasError: false });
    }
  }

  private handleRetry = () => {
    this.props.onReset?.();
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const variant = this.props.variant ?? 'section';
    return (
      <section
        className={`error-boundary error-boundary--${variant}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="error-boundary__icon" aria-hidden="true">
          <i className="fa-solid fa-triangle-exclamation" />
        </div>
        <div className="error-boundary__content">
          <h2>{this.props.title}</h2>
          <p>{this.props.message}</p>
          <div className="error-boundary__actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.handleRetry}
            >
              <i className="fa-solid fa-rotate-right" aria-hidden="true" />
              Tentar novamente
            </button>
            {this.props.secondaryAction && (
              <button
                type="button"
                className="btn"
                onClick={this.props.secondaryAction.onClick}
              >
                {this.props.secondaryAction.label}
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }
}

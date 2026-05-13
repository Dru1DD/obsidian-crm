import React from "react";
import { toast } from "react-toastify";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    toast(error.message, { type: "error" });
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <h1>
          Something went wrong. <a href="/">Go Home</a>
        </h1>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

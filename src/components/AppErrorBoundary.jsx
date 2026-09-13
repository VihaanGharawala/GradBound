import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Keep the production UI alive even if a third-party component or malformed
    // record throws during rendering. Do not persist sensitive error details.
    if (import.meta.env?.DEV) console.error("GradBound render error:", error);
  }

  reset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-[60vh] grid place-items-center px-5 py-16">
        <div className="max-w-md rounded-3xl border border-border bg-card p-7 text-center shadow-lg">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary text-xl font-black">!</div>
          <h1 className="text-2xl font-black">GradBound hit a temporary hiccup</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Your saved profile is still safe. Refresh the app and continue where you left off.</p>
          <button type="button" onClick={this.reset} className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90">Reload GradBound</button>
        </div>
      </div>
    );
  }
}

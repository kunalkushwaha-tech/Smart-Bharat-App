"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { emergencyContacts } from "../lib/emergencyContacts";

type EmergencyErrorBoundaryProps = {
  children: ReactNode;
};

type EmergencyErrorBoundaryState = {
  hasError: boolean;
};

export default class EmergencyErrorBoundary extends Component<
  EmergencyErrorBoundaryProps,
  EmergencyErrorBoundaryState
> {
  state: EmergencyErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): EmergencyErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Emergency Services section failed to render", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <section
        aria-labelledby="emergency-fallback-heading"
        className="rounded-2xl border border-red-400/50 bg-[#351522] p-6"
      >
        <h2 id="emergency-fallback-heading" className="text-2xl font-bold text-red-100">
          Emergency Services
        </h2>
        <p className="mt-2 text-sm text-red-100">
          Interactive emergency tools are temporarily unavailable. Call an emergency service directly:
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {emergencyContacts.map((contact) => (
            <a
              key={`fallback-${contact.number}-${contact.title}`}
              href={`tel:${contact.number}`}
              className="rounded-full bg-red-600 px-4 py-2 font-semibold text-white underline-offset-2 hover:bg-red-700 focus-visible:outline"
            >
              {contact.number} - {contact.title}
            </a>
          ))}
        </div>
      </section>
    );
  }
}

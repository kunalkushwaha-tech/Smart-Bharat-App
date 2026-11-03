import * as Sentry from "@sentry/nextjs";

function scrubEvent(event: Sentry.ErrorEvent) {
  if (event.request) {
    delete event.request.data;
    delete event.request.query_string;
    if (event.request.url) {
      try {
        const url = new URL(event.request.url);
        event.request.url = `${url.origin}${url.pathname}`;
      } catch {
        event.request.url = "[redacted]";
      }
    }
  }
  event.breadcrumbs = event.breadcrumbs?.map((breadcrumb) => ({
    ...breadcrumb,
    data: undefined,
    message: breadcrumb.message ? "[redacted]" : breadcrumb.message,
  }));
  return event;
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  sendDefaultPii: false,
  tracesSampleRate: 0.01,
  beforeSend: scrubEvent,
});

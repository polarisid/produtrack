export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

export type GoogleCalendarEvent = {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink: string;
  colorId?: string;
};

/** Dynamically loads the Google Identity Services script */
export function loadGoogleIdentityScript(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve();
    if ((window as any).google?.accounts?.oauth2) return resolve();

    const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => resolve(); // fail silently
    document.head.appendChild(script);
  });
}

/** Opens a Google OAuth popup to authorize Calendar access. */
export function requestCalendarAccess(
  onSuccess: (token: string) => void,
  onError?: () => void
): void {
  const g = (window as any).google;
  if (!g?.accounts?.oauth2) {
    console.error('Google Identity Services not loaded');
    onError?.();
    return;
  }

  const tokenClient = g.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: CALENDAR_SCOPE,
    callback: (response: any) => {
      if (response.error) {
        console.error('Google Auth error:', response.error);
        onError?.();
        return;
      }
      onSuccess(response.access_token);
    },
  });

  tokenClient.requestAccessToken({ prompt: '' }); // '' = only prompt if needed
}

/** Fetches events from the user's primary Google Calendar for a date range. */
export async function fetchCalendarEvents(
  token: string,
  startDate: Date,
  endDate: Date
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '200',
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    if (res.status === 401) throw new Error('token_expired');
    throw new Error(`Calendar API ${res.status}`);
  }

  const data = await res.json();
  return (data.items ?? []) as GoogleCalendarEvent[];
}

/** Creates a new event in the user's primary Google Calendar. */
export async function createCalendarEvent(
  token: string,
  title: string,
  date: Date,
  description?: string
): Promise<GoogleCalendarEvent> {
  const endDate = new Date(date);
  endDate.setHours(date.getHours() + 1);

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: title,
        description,
        start: { dateTime: date.toISOString() },
        end: { dateTime: endDate.toISOString() },
      }),
    }
  );

  if (!res.ok) {
    if (res.status === 401) throw new Error('token_expired');
    throw new Error(`Create event error ${res.status}`);
  }

  return res.json();
}

/** Returns the YYYY-MM-DD string for a Google Calendar event. */
export function getEventDateKey(event: GoogleCalendarEvent): string {
  const raw = event.start.dateTime ?? event.start.date ?? '';
  return raw.substring(0, 10);
}

/** Extracts time string (HH:MM) from a Google Calendar event datetime. */
export function getEventTime(event: GoogleCalendarEvent): string {
  if (!event.start.dateTime) return 'Dia inteiro';
  const d = new Date(event.start.dateTime);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

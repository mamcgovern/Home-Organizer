import {
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";

import { auth } from "../firebase/config";

const CALENDAR_SCOPE =
    "https://www.googleapis.com/auth/calendar.readonly";

const TOKEN_KEY = "googleCalendarAccessToken";
const TOKEN_EXPIRATION_KEY = "googleCalendarTokenExpiration";

export async function connectGoogleCalendar() {
    const provider = new GoogleAuthProvider();

    provider.addScope(CALENDAR_SCOPE);

    provider.setCustomParameters({
        prompt: "consent",
    });

    const result = await signInWithPopup(auth, provider);

    const credential =
        GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
        throw new Error(
            "Google did not return a Calendar access token."
        );
    }

    const expirationTime = Date.now() + 55 * 60 * 1000;

    sessionStorage.setItem(
        TOKEN_KEY,
        credential.accessToken
    );

    sessionStorage.setItem(
        TOKEN_EXPIRATION_KEY,
        String(expirationTime)
    );

    return {
        token: credential.accessToken,
        user: result.user,
    };
}

export function getStoredCalendarToken() {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const expiration = Number(
        sessionStorage.getItem(TOKEN_EXPIRATION_KEY)
    );

    if (!token || !expiration || Date.now() >= expiration) {
        disconnectGoogleCalendar();
        return null;
    }

    return token;
}

export function disconnectGoogleCalendar() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRATION_KEY);
}

export async function getUpcomingCalendarEvents(
    accessToken,
    maximumEvents = 20
) {
    const parameters = new URLSearchParams({
        timeMin: new Date().toISOString(),
        maxResults: String(maximumEvents),
        singleEvents: "true",
        orderBy: "startTime",
    });

    const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${parameters}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
            },
        }
    );

    if (response.status === 401) {
        disconnectGoogleCalendar();

        throw new Error(
            "Your Google Calendar connection expired. Please reconnect."
        );
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        console.error("Google Calendar error:", errorData);

        throw new Error(
            "We couldn't load your Google Calendar events."
        );
    }

    const data = await response.json();

    return data.items || [];
}
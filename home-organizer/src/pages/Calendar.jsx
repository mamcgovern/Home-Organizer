import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    CalendarDays,
    Clock,
    ExternalLink,
    LayoutGrid,
    List,
    LoaderCircle,
    LogOut,
    MapPin,
    RefreshCw,
    Timer,
} from "lucide-react";

import { onAuthStateChanged } from "firebase/auth";

import CountdownView from "../components/calendar/CountdownView";
import MonthCalendar from "../components/calendar/MonthCalendar";

import { auth } from "../firebase/config";

import {
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    getStoredCalendarToken,
    getUpcomingCalendarEvents,
} from "../services/calendarService";

import {
    getCalendarViewPreference,
    saveCalendarViewPreference,
} from "../services/userPreferencesService";

import "../styles/calendar.css";

function getEventStart(event) {
    return event.start?.dateTime || event.start?.date || null;
}

function isAllDayEvent(event) {
    return Boolean(
        event.start?.date && !event.start?.dateTime
    );
}

function formatEventDate(event) {
    const start = getEventStart(event);

    if (!start) {
        return "Date unavailable";
    }

    if (isAllDayEvent(event)) {
        return new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            timeZone: "UTC",
        }).format(new Date(`${start}T00:00:00Z`));
    }

    return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    }).format(new Date(start));
}

function formatEventTime(event) {
    if (isAllDayEvent(event)) {
        return "All day";
    }

    const start = event.start?.dateTime;
    const end = event.end?.dateTime;

    if (!start) {
        return "Time unavailable";
    }

    const timeFormatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

    if (!end) {
        return timeFormatter.format(new Date(start));
    }

    return `${timeFormatter.format(
        new Date(start)
    )} – ${timeFormatter.format(new Date(end))}`;
}

function Calendar() {
    const [accessToken, setAccessToken] = useState(
        () => getStoredCalendarToken()
    );

    const [currentUser, setCurrentUser] = useState(
        () => auth.currentUser
    );

    const [events, setEvents] = useState([]);
    const [activeView, setActiveView] = useState("list");

    const [isConnecting, setIsConnecting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPreference, setIsLoadingPreference] =
        useState(true);

    const [error, setError] = useState("");

    const loadEvents = useCallback(async (token) => {
        try {
            setError("");
            setIsLoading(true);

            const calendarEvents =
                await getUpcomingCalendarEvents(token, 250);

            setEvents(calendarEvents);
        } catch (loadError) {
            console.error(loadError);
            setError(loadError.message);

            if (!getStoredCalendarToken()) {
                setAccessToken(null);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadViewPreference = useCallback(async (user) => {
        if (!user) {
            setActiveView("list");
            setIsLoadingPreference(false);
            return;
        }

        try {
            setIsLoadingPreference(true);

            const savedView =
                await getCalendarViewPreference(user.uid);

            setActiveView(savedView);
        } catch (preferenceError) {
            console.error(
                "Could not load calendar view preference:",
                preferenceError
            );

            setActiveView("list");
        } finally {
            setIsLoadingPreference(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
                setCurrentUser(user);
                loadViewPreference(user);
            }
        );

        return unsubscribe;
    }, [loadViewPreference]);

    useEffect(() => {
        if (accessToken) {
            loadEvents(accessToken);
        }
    }, [accessToken, loadEvents]);

    async function handleConnect() {
        try {
            setError("");
            setIsConnecting(true);

            const connection =
                await connectGoogleCalendar();

            setCurrentUser(connection.user);
            setAccessToken(connection.token);

            await loadViewPreference(connection.user);
        } catch (connectionError) {
            console.error(connectionError);

            if (
                connectionError.code ===
                "auth/popup-closed-by-user"
            ) {
                setError(
                    "Google Calendar connection was cancelled."
                );
            } else {
                setError(
                    connectionError.message ||
                        "We couldn't connect Google Calendar."
                );
            }
        } finally {
            setIsConnecting(false);
        }
    }

    function handleDisconnect() {
        disconnectGoogleCalendar();

        setAccessToken(null);
        setEvents([]);
        setError("");
    }

    async function changeView(nextView) {
        setActiveView(nextView);

        if (!currentUser) {
            return;
        }

        try {
            await saveCalendarViewPreference(
                currentUser.uid,
                nextView
            );
        } catch (preferenceError) {
            console.error(
                "Could not save calendar view preference:",
                preferenceError
            );

            setError(
                "Your view changed, but we couldn't save the preference."
            );
        }
    }

    function renderListView() {
        return (
            <section className="calendar-events">
                <header className="calendar-events-header">
                    <div>
                        <p className="card-eyebrow">
                            Your schedule
                        </p>

                        <h3>Upcoming events</h3>
                    </div>

                    <span>
                        {events.length}{" "}
                        {events.length === 1
                            ? "event"
                            : "events"}
                    </span>
                </header>

                <div className="calendar-event-list">
                    {events.map((event) => (
                        <article
                            className="calendar-event"
                            key={event.id}
                        >
                            <div className="calendar-event-date">
                                <span>
                                    {formatEventDate(event)}
                                </span>
                            </div>

                            <div className="calendar-event-details">
                                <h3>
                                    {event.summary ||
                                        "Untitled event"}
                                </h3>

                                <div className="calendar-event-meta">
                                    <span>
                                        <Clock size={15} />
                                        {formatEventTime(event)}
                                    </span>

                                    {event.location && (
                                        <span>
                                            <MapPin size={15} />
                                            {event.location}
                                        </span>
                                    )}
                                </div>

                                {event.description && (
                                    <p>
                                        {event.description.replace(
                                            /<[^>]*>/g,
                                            ""
                                        )}
                                    </p>
                                )}
                            </div>

                            {event.htmlLink && (
                                <a
                                    className="calendar-event-link"
                                    href={event.htmlLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`Open ${
                                        event.summary ||
                                        "calendar event"
                                    } in Google Calendar`}
                                >
                                    <ExternalLink size={18} />
                                </a>
                            )}
                        </article>
                    ))}
                </div>
            </section>
        );
    }

    function renderCalendarContent() {
        if (isLoading && events.length === 0) {
            return (
                <div className="movie-state">
                    <LoaderCircle
                        className="loading-icon"
                        size={34}
                    />

                    <p>Loading your calendar...</p>
                </div>
            );
        }

        if (events.length === 0) {
            return (
                <section className="calendar-connect-card">
                    <div className="calendar-connect-icon">
                        <CalendarDays size={38} />
                    </div>

                    <h3>No upcoming events</h3>

                    <p>
                        There are no upcoming events on your
                        primary Google Calendar.
                    </p>
                </section>
            );
        }

        if (isLoadingPreference) {
            return (
                <div className="movie-state">
                    <LoaderCircle
                        className="loading-icon"
                        size={34}
                    />

                    <p>Loading your preferred view...</p>
                </div>
            );
        }

        if (activeView === "calendar") {
            return <MonthCalendar events={events} />;
        }

        if (activeView === "countdown") {
            return <CountdownView events={events} />;
        }

        return renderListView();
    }

    return (
        <div className="calendar-page">
            <header className="page-header">
                <div>
                    <p className="page-kicker">
                        See what’s ahead
                    </p>

                    <h2>Calendar</h2>

                    <p className="page-description">
                        View upcoming events from your Google
                        Calendar.
                    </p>
                </div>

                {accessToken && (
                    <div className="calendar-header-actions">
                        <button
                            className="secondary-button calendar-action-button"
                            type="button"
                            onClick={() =>
                                loadEvents(accessToken)
                            }
                            disabled={isLoading}
                        >
                            <RefreshCw size={17} />
                            Refresh
                        </button>

                        <button
                            className="secondary-button calendar-action-button"
                            type="button"
                            onClick={handleDisconnect}
                        >
                            <LogOut size={17} />
                            Disconnect
                        </button>
                    </div>
                )}
            </header>

            {error && (
                <p className="error-message">{error}</p>
            )}

            {!accessToken ? (
                <section className="calendar-connect-card">
                    <div className="calendar-connect-icon">
                        <CalendarDays size={38} />
                    </div>

                    <h3>Connect Google Calendar</h3>

                    <p>
                        Sign in with Google to display your
                        upcoming events in Home Organizer. The app
                        will only have permission to view your
                        calendar.
                    </p>

                    <button
                        className="primary-button calendar-connect-button"
                        type="button"
                        onClick={handleConnect}
                        disabled={isConnecting}
                    >
                        {isConnecting ? (
                            <>
                                <LoaderCircle
                                    className="loading-icon loading-icon--small"
                                    size={18}
                                />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <CalendarDays size={18} />
                                Connect Google Calendar
                            </>
                        )}
                    </button>
                </section>
            ) : (
                <>
                    <div className="calendar-view-switcher">
                        <button
                            className={
                                activeView === "list"
                                    ? "calendar-view-button calendar-view-button--active"
                                    : "calendar-view-button"
                            }
                            type="button"
                            onClick={() =>
                                changeView("list")
                            }
                        >
                            <List size={17} />
                            List
                        </button>

                        <button
                            className={
                                activeView === "calendar"
                                    ? "calendar-view-button calendar-view-button--active"
                                    : "calendar-view-button"
                            }
                            type="button"
                            onClick={() =>
                                changeView("calendar")
                            }
                        >
                            <LayoutGrid size={17} />
                            Calendar
                        </button>

                        <button
                            className={
                                activeView === "countdown"
                                    ? "calendar-view-button calendar-view-button--active"
                                    : "calendar-view-button"
                            }
                            type="button"
                            onClick={() =>
                                changeView("countdown")
                            }
                        >
                            <Timer size={17} />
                            Countdown
                        </button>
                    </div>

                    {renderCalendarContent()}
                </>
            )}
        </div>
    );
}

export default Calendar;
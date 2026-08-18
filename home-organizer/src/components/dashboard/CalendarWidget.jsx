import { useCallback, useEffect, useState } from "react";
import {
    CalendarDays,
    ChevronRight,
    Clock,
    LoaderCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
    connectGoogleCalendar,
    getStoredCalendarToken,
    getUpcomingCalendarEvents,
} from "../../services/calendarService";

function isAllDayEvent(event) {
    return Boolean(event.start?.date && !event.start?.dateTime);
}

function formatEventDate(event) {
    const start = event.start?.dateTime || event.start?.date;

    if (!start) {
        return "Date unavailable";
    }

    if (isAllDayEvent(event)) {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
        }).format(new Date(`${start}T00:00:00Z`));
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(new Date(start));
}

function formatEventTime(event) {
    if (isAllDayEvent(event)) {
        return "All day";
    }

    if (!event.start?.dateTime) {
        return "Time unavailable";
    }

    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(event.start.dateTime));
}

function CalendarWidget() {
    const [accessToken, setAccessToken] = useState(
        () => getStoredCalendarToken()
    );
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(
        Boolean(accessToken)
    );
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState("");

    const loadEvents = useCallback(async (token) => {
        try {
            setError("");
            setIsLoading(true);

            const upcomingEvents =
                await getUpcomingCalendarEvents(token, 3);

            setEvents(upcomingEvents);
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

            setAccessToken(connection.token);
        } catch (connectionError) {
            console.error(connectionError);

            if (
                connectionError.code !==
                "auth/popup-closed-by-user"
            ) {
                setError(
                    connectionError.message ||
                        "Calendar connection failed."
                );
            }
        } finally {
            setIsConnecting(false);
        }
    }

    return (
        <article className="dashboard-card calendar-widget">
            <div className="card-heading">
                <div>
                    <p className="card-eyebrow">Coming up</p>
                    <h3>Calendar</h3>
                </div>

                <CalendarDays size={24} />
            </div>

            {!accessToken ? (
                <div className="calendar-widget-empty">
                    <CalendarDays size={30} strokeWidth={1.5} />

                    <p>Connect your Google Calendar</p>

                    <span>
                        See your next events from the dashboard.
                    </span>

                    <button
                        className="calendar-widget-connect"
                        type="button"
                        onClick={handleConnect}
                        disabled={isConnecting}
                    >
                        {isConnecting
                            ? "Connecting..."
                            : "Connect Calendar"}
                    </button>
                </div>
            ) : isLoading ? (
                <div className="calendar-widget-empty">
                    <LoaderCircle
                        className="loading-icon"
                        size={28}
                    />
                    <p>Loading your events...</p>
                </div>
            ) : error ? (
                <div className="calendar-widget-empty">
                    <p>Calendar unavailable</p>
                    <span>{error}</span>

                    <Link
                        className="calendar-widget-connect"
                        to="/calendar"
                    >
                        Open Calendar
                    </Link>
                </div>
            ) : events.length === 0 ? (
                <div className="calendar-widget-empty">
                    <CalendarDays size={30} strokeWidth={1.5} />
                    <p>No upcoming events</p>
                    <span>Your schedule is clear.</span>
                </div>
            ) : (
                <>
                    <div className="calendar-widget-events">
                        {events.map((event) => (
                            <div
                                className="calendar-widget-event"
                                key={event.id}
                            >
                                <div className="calendar-widget-date">
                                    {formatEventDate(event)}
                                </div>

                                <div className="calendar-widget-info">
                                    <p>
                                        {event.summary ||
                                            "Untitled event"}
                                    </p>

                                    <span>
                                        <Clock size={13} />
                                        {formatEventTime(event)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link
                        className="calendar-widget-link"
                        to="/calendar"
                    >
                        View full calendar
                        <ChevronRight size={16} />
                    </Link>
                </>
            )}
        </article>
    );
}

export default CalendarWidget;
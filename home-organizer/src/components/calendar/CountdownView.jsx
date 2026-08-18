import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    Clock,
    ExternalLink,
    MapPin,
} from "lucide-react";

function getEventStart(event) {
    if (event.start?.dateTime) {
        return new Date(event.start.dateTime);
    }

    if (event.start?.date) {
        return new Date(`${event.start.date}T00:00:00`);
    }

    return null;
}

function getCountdown(event, now) {
    const start = getEventStart(event);

    if (!start) {
        return null;
    }

    const difference = Math.max(
        start.getTime() - now.getTime(),
        0
    );

    const totalMinutes = Math.floor(difference / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    return {
        days,
        hours,
        minutes,
    };
}

function formatEventDate(event) {
    const start = getEventStart(event);

    if (!start) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(start);
}

function formatEventTime(event) {
    if (event.start?.date && !event.start?.dateTime) {
        return "All day";
    }

    const start = getEventStart(event);

    if (!start) {
        return "Time unavailable";
    }

    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    }).format(start);
}

function CountdownView({ events }) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const interval = window.setInterval(() => {
            setNow(new Date());
        }, 60000);

        return () => window.clearInterval(interval);
    }, []);

    const upcomingEvents = useMemo(() => {
        return events.filter((event) => {
            const start = getEventStart(event);
            return start && start >= now;
        });
    }, [events, now]);

    if (!upcomingEvents.length) {
        return (
            <div className="movie-state">
                <div className="movie-state-icon">
                    <Clock size={34} />
                </div>

                <h3>No upcoming countdowns</h3>
                <p>Your future events will appear here.</p>
            </div>
        );
    }

    return (
        <section className="countdown-view">
            {upcomingEvents.map((event, index) => {
                const countdown = getCountdown(event, now);

                return (
                    <article
                        className={
                            index === 0
                                ? "countdown-card countdown-card--next"
                                : "countdown-card"
                        }
                        key={event.id}
                    >
                        {index === 0 && (
                            <p className="card-eyebrow">
                                Your next event
                            </p>
                        )}

                        <header className="countdown-card-header">
                            <div>
                                <h3>
                                    {event.summary ||
                                        "Untitled event"}
                                </h3>

                                <div className="countdown-event-meta">
                                    <span>
                                        <CalendarDays size={15} />
                                        {formatEventDate(event)}
                                    </span>

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
                            </div>

                            {event.htmlLink && (
                                <a
                                    href={event.htmlLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`Open ${
                                        event.summary || "event"
                                    } in Google Calendar`}
                                >
                                    <ExternalLink size={18} />
                                </a>
                            )}
                        </header>

                        {countdown && (
                            <div className="countdown-numbers">
                                <div>
                                    <strong>{countdown.days}</strong>
                                    <span>Days</span>
                                </div>

                                <div>
                                    <strong>{countdown.hours}</strong>
                                    <span>Hours</span>
                                </div>

                                <div>
                                    <strong>{countdown.minutes}</strong>
                                    <span>Minutes</span>
                                </div>
                            </div>
                        )}
                    </article>
                );
            })}
        </section>
    );
}

export default CountdownView;
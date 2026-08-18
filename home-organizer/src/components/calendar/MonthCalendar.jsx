import { useMemo, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    ExternalLink,
} from "lucide-react";

const weekdays = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
];

function getDateKeyFromDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getEventDateKey(event) {
    if (event.start?.date) {
        return event.start.date;
    }

    if (event.start?.dateTime) {
        return getDateKeyFromDate(new Date(event.start.dateTime));
    }

    return null;
}

function formatEventTime(event) {
    if (event.start?.date && !event.start?.dateTime) {
        return "All day";
    }

    if (!event.start?.dateTime) {
        return "";
    }

    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(event.start.dateTime));
}

function MonthCalendar({ events }) {
    const [displayedMonth, setDisplayedMonth] = useState(
        () => new Date()
    );

    const monthLabel = new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
    }).format(displayedMonth);

    const calendarDays = useMemo(() => {
        const year = displayedMonth.getFullYear();
        const month = displayedMonth.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(
            year,
            month + 1,
            0
        ).getDate();

        const cells = [];

        for (let index = 0; index < firstDay; index += 1) {
            cells.push(null);
        }

        for (let day = 1; day <= daysInMonth; day += 1) {
            cells.push(new Date(year, month, day));
        }

        while (cells.length % 7 !== 0) {
            cells.push(null);
        }

        return cells;
    }, [displayedMonth]);

    const eventsByDate = useMemo(() => {
        return events.reduce((groups, event) => {
            const dateKey = getEventDateKey(event);

            if (!dateKey) {
                return groups;
            }

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }

            groups[dateKey].push(event);

            return groups;
        }, {});
    }, [events]);

    function changeMonth(amount) {
        setDisplayedMonth((currentMonth) => {
            return new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + amount,
                1
            );
        });
    }

    function returnToToday() {
        setDisplayedMonth(new Date());
    }

    const todayKey = getDateKeyFromDate(new Date());

    return (
        <section className="month-calendar">
            <header className="month-calendar-header">
                <div className="month-navigation">
                    <button
                        type="button"
                        aria-label="Previous month"
                        onClick={() => changeMonth(-1)}
                    >
                        <ChevronLeft size={19} />
                    </button>

                    <button
                        type="button"
                        aria-label="Next month"
                        onClick={() => changeMonth(1)}
                    >
                        <ChevronRight size={19} />
                    </button>

                    <button
                        className="month-today-button"
                        type="button"
                        onClick={returnToToday}
                    >
                        Today
                    </button>
                </div>

                <h3>{monthLabel}</h3>
            </header>

            <div className="month-weekdays">
                {weekdays.map((weekday) => (
                    <span key={weekday}>{weekday}</span>
                ))}
            </div>

            <div className="month-calendar-grid">
                {calendarDays.map((date, index) => {
                    if (!date) {
                        return (
                            <div
                                className="month-day month-day--empty"
                                key={`empty-${index}`}
                            />
                        );
                    }

                    const dateKey = getDateKeyFromDate(date);
                    const dayEvents = eventsByDate[dateKey] || [];
                    const visibleEvents = dayEvents.slice(0, 3);
                    const hiddenCount =
                        dayEvents.length - visibleEvents.length;

                    return (
                        <div
                            className={
                                dateKey === todayKey
                                    ? "month-day month-day--today"
                                    : "month-day"
                            }
                            key={dateKey}
                        >
                            <span className="month-day-number">
                                {date.getDate()}
                            </span>

                            <div className="month-day-events">
                                {visibleEvents.map((event) => (
                                    <a
                                        className="month-event"
                                        key={event.id}
                                        href={event.htmlLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        title={event.summary}
                                    >
                                        <span>
                                            {formatEventTime(event)}
                                        </span>

                                        <strong>
                                            {event.summary ||
                                                "Untitled"}
                                        </strong>

                                        <ExternalLink size={11} />
                                    </a>
                                ))}

                                {hiddenCount > 0 && (
                                    <span className="month-more-events">
                                        +{hiddenCount} more
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default MonthCalendar;
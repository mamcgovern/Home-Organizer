import {
    CalendarDays,
    CheckCircle2,
    Circle,
    CloudSun,
    Film,
    ShoppingBasket,
    Utensils,
} from "lucide-react";

import "../styles/dashboard.css";

const upcomingTasks = [
    {
        id: 1,
        title: "Take out the recycling",
        due: "Today",
        category: "Chores",
    },
    {
        id: 2,
        title: "Finish the grocery list",
        due: "Today",
        category: "Groceries",
    },
    {
        id: 3,
        title: "Schedule Willow's appointment",
        due: "Tomorrow",
        category: "Personal",
    },
];

function Home() {
    const today = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    }).format(new Date());

    return (
        <div className="dashboard">
            <header className="page-header">
                <div>
                    <p className="page-kicker">{today}</p>
                    <h2>Good morning, Maddie!</h2>
                    <p className="page-description">
                        Here’s what is happening around your home.
                    </p>
                </div>
            </header>

            <section className="summary-grid">
                <article className="summary-card">
                    <div className="summary-icon summary-icon--tasks">
                        <CheckCircle2 size={22} />
                    </div>

                    <div>
                        <p className="summary-label">Tasks completed</p>
                        <p className="summary-value">4 of 7</p>
                    </div>
                </article>

                <article className="summary-card">
                    <div className="summary-icon summary-icon--meals">
                        <Utensils size={22} />
                    </div>

                    <div>
                        <p className="summary-label">Tonight’s dinner</p>
                        <p className="summary-value summary-value--small">
                            Chicken tacos
                        </p>
                    </div>
                </article>

                <article className="summary-card">
                    <div className="summary-icon summary-icon--groceries">
                        <ShoppingBasket size={22} />
                    </div>

                    <div>
                        <p className="summary-label">Grocery items</p>
                        <p className="summary-value">12</p>
                    </div>
                </article>
            </section>

            <section className="dashboard-grid">
                <article className="dashboard-card weather-card">
                    <div className="card-heading">
                        <div>
                            <p className="card-eyebrow">Ames, Iowa</p>
                            <h3>Weather</h3>
                        </div>

                        <CloudSun size={32} />
                    </div>

                    <div className="weather-content">
                        <p className="weather-temperature">74°</p>

                        <div>
                            <p className="weather-condition">Partly cloudy</p>
                            <p className="weather-range">High 78° · Low 61°</p>
                        </div>
                    </div>

                    <p className="widget-note">
                        We’ll connect live weather data later.
                    </p>
                </article>

                <article className="dashboard-card">
                    <div className="card-heading">
                        <div>
                            <p className="card-eyebrow">Today</p>
                            <h3>Upcoming tasks</h3>
                        </div>

                        <CheckCircle2 size={24} />
                    </div>

                    <div className="task-preview-list">
                        {upcomingTasks.map((task) => (
                            <div className="task-preview" key={task.id}>
                                <button
                                    className="task-check"
                                    type="button"
                                    aria-label={`Complete ${task.title}`}
                                >
                                    <Circle size={21} />
                                </button>

                                <div className="task-preview-info">
                                    <p>{task.title}</p>
                                    <span>
                                        {task.category} · {task.due}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="dashboard-card">
                    <div className="card-heading">
                        <div>
                            <p className="card-eyebrow">This week</p>
                            <h3>Calendar</h3>
                        </div>

                        <CalendarDays size={24} />
                    </div>

                    <div className="empty-widget">
                        <CalendarDays size={34} strokeWidth={1.5} />
                        <p>No events connected yet.</p>
                        <span>
                            Google Calendar integration will appear here.
                        </span>
                    </div>
                </article>

                <article className="dashboard-card">
                    <div className="card-heading">
                        <div>
                            <p className="card-eyebrow">Next up</p>
                            <h3>Watchlist</h3>
                        </div>

                        <Film size={24} />
                    </div>

                    <div className="watch-preview">
                        <div className="watch-poster-placeholder">
                            <Film size={30} />
                        </div>

                        <div>
                            <p className="watch-title">Movie night awaits</p>
                            <p className="watch-description">
                                Add movies and shows you and Nick want to watch.
                            </p>
                        </div>
                    </div>
                </article>
            </section>
        </div>
    );
}

export default Home;
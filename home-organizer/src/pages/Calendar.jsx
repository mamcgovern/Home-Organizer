function Calendar() {
    return (
        <div>
            <header className="page-header">
                <div>
                    <p className="page-kicker">See what’s ahead</p>
                    <h2>Calendar</h2>
                    <p className="page-description">
                        View household events, appointments, and important due
                        dates.
                    </p>
                </div>

                <button className="primary-button" type="button">
                    Add event
                </button>
            </header>

            <section className="placeholder-card">
                <h3>Your household calendar will go here</h3>
                <p>
                    We can connect this page to Google Calendar after Firebase
                    authentication is working.
                </p>
            </section>
        </div>
    );
}

export default Calendar;
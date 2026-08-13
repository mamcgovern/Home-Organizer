function Chores() {
    return (
        <div>
            <header className="page-header">
                <div>
                    <p className="page-kicker">Keep things tidy</p>
                    <h2>Chores</h2>
                    <p className="page-description">
                        Assign recurring chores and keep track of when they were
                        last completed.
                    </p>
                </div>

                <button className="primary-button" type="button">
                    Add chore
                </button>
            </header>

            <section className="placeholder-card">
                <h3>Your chore tracker will go here</h3>
                <p>
                    Chores can repeat daily, weekly, monthly, or on a custom
                    schedule.
                </p>
            </section>
        </div>
    );
}

export default Chores;
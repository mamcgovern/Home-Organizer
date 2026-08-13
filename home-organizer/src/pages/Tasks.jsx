function Tasks() {
    return (
        <div>
            <header className="page-header">
                <div>
                    <p className="page-kicker">Stay organized</p>
                    <h2>Tasks</h2>
                    <p className="page-description">
                        Create projects, assign tasks, set due dates, and track
                        what needs to get done.
                    </p>
                </div>

                <button className="primary-button" type="button">
                    Add task
                </button>
            </header>

            <section className="placeholder-card">
                <h3>Your task manager will go here</h3>
                <p>
                    We’ll build this with projects, sections, assignees, due
                    dates, priorities, and completion tracking.
                </p>
            </section>
        </div>
    );
}

export default Tasks;
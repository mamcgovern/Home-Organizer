function Watchlist() {
    return (
        <div>
            <header className="page-header">
                <div>
                    <p className="page-kicker">For your next movie night</p>
                    <h2>Watchlist</h2>
                    <p className="page-description">
                        Save movies and shows you and Nick want to watch.
                    </p>
                </div>

                <button className="primary-button" type="button">
                    Add title
                </button>
            </header>

            <section className="placeholder-card">
                <h3>Your movie and show watchlist will go here</h3>
                <p>
                    We’ll be able to track the streaming service, genre, whose
                    pick it is, and whether you’ve watched it.
                </p>
            </section>
        </div>
    );
}

export default Watchlist;
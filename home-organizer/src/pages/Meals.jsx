function Meals() {
    return (
        <div>
            <header className="page-header">
                <div>
                    <p className="page-kicker">Plan your week</p>
                    <h2>Meals</h2>
                    <p className="page-description">
                        Plan breakfasts, lunches, and dinners for the week.
                    </p>
                </div>

                <button className="primary-button" type="button">
                    Add meal
                </button>
            </header>

            <section className="placeholder-card">
                <h3>Your weekly meal plan will go here</h3>
                <p>
                    Meals will eventually connect directly to your grocery
                    list.
                </p>
            </section>
        </div>
    );
}

export default Meals;
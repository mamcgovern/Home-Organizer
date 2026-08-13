function Groceries() {
    return (
        <div>
            <header className="page-header">
                <div>
                    <p className="page-kicker">Shopping made easier</p>
                    <h2>Groceries</h2>
                    <p className="page-description">
                        Keep one shared grocery list for the household.
                    </p>
                </div>

                <button className="primary-button" type="button">
                    Add item
                </button>
            </header>

            <section className="placeholder-card">
                <h3>Your grocery list will go here</h3>
                <p>
                    We’ll organize items by categories like produce, dairy,
                    pantry, frozen, and household supplies.
                </p>
            </section>
        </div>
    );
}

export default Groceries;
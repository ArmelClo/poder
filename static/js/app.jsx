const {useState, useEffect, StrictMode, Fragment} = React

const App = () => {
    const [state, setState] = useState({text: "loading", color: "bg-warning"});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/status");
                const data = await response.json();

                let statusColor, temperature, temperatureColor
                if (data.status.PowerIsOn){
                    statusColor = "bg-success"
                    temperature = data.temperature
                    if (data.temperature > data.maxTemp -10 ) {
                        temperatureColor = "bg-warning"
                    } else {
                        temperatureColor = "bg-success"
                    }
                } else {
                    statusColor = "bg-danger"
                    temperature = null
                    temperatureColor = null
                }

                setState({text: "Started", color: statusColor, temperature: temperature, temperatureColor: temperatureColor});
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []); // add dependencies to re-run the effect when they change
    return (
        <Fragment>
            <div className="d-flex justify-content-center mb-3 mt-3">
                <div className={"p-3 m-2 rounded " + state.color}>Status: {state.text}</div>
                {state.temperatureColor === null ||
                    <div className={"p-3 m-2 rounded " + state.temperatureColor}>Temperature: {state.temperature}</div>
                }
            </div>

            <div className="d-flex justify-content-center mb-3">
            <img src="/img/kevin.jpg" alt="kevin"/>
            </div>

            <div className="d-flex justify-content-evenly">
                <a href="/start">
                    <button type="button" className="btn btn-success">Start</button>
                </a>
                <a href="/stop">
                    <button type="button" className="btn btn-danger">Stop</button>
                </a>
            </div>
        </Fragment>
    )
}

const root = ReactDOM.createRoot(document.querySelector('#app'));

root.render(<StrictMode><App/></StrictMode>)
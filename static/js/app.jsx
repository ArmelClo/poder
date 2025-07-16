const {useState, useEffect, StrictMode, Fragment} = React

const App = () => {
    const [state, setState] = useState({text: "loading", color: "bg-warning"});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/status");
                const data = await response.json();

                let statusColor, temperature, temperatureColor, text
                if (data.status.PowerIsOn){
                    statusColor = "bg-success"
                    temperature = data.temperature
                    text = "Started"
                    if (data.temperature > data.maxTemp -10 ) {
                        temperatureColor = "bg-warning"
                    } else {
                        temperatureColor = "bg-success"
                    }
                } else {
                    text = "Stopped"
                    statusColor = "bg-danger"
                    temperature = null
                    temperatureColor = null
                }

                setState({text: text, color: statusColor, temperature: temperature, temperatureColor: temperatureColor});
            } catch (error) {
                console.error(error);
            }
        };
        const intervalId = setInterval(fetchData, 10000); // 10000 milliseconds = 10 seconds
        return () => {
            clearInterval(intervalId);
        };
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
                <button type="button" onClick={() => fetch("/start")} className="btn btn-success">Start</button>
                <button type="button" onClick={() => fetch("/stop")} className="btn btn-danger">Stop</button>
            </div>
        </Fragment>
    )
}

const root = ReactDOM.createRoot(document.querySelector('#app'));

root.render(<StrictMode><App/></StrictMode>)
const {useState, useEffect, StrictMode, Fragment} = React

const App = () => {
    const [state, setState] = useState({text: "loading", color: "bg-warning"});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/status");
                const data = await response.json();

                console.log(data.status.PowerIsOn)

                if (data.status.PowerIsOn){
                    setState({text: "Started", color: "bg-success"});
                    return
                }
                setState({text: "Stoped", color: "bg-danger"});
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []); // add dependencies to re-run the effect when they change
    return (
        <Fragment>
            <div className="d-flex justify-content-center mb-3 mt-3">
                <div className={"p-3 mb-2 rounded " + state.color}>Status: {state.text}</div>
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
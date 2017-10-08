/* global Backendless */
/*global PublishOptions*/
/*global PublishOptionsHeaders*/
import React, {Component} from 'react';
import {BACKENDLESS_API_KEY, BACKENDLESS_APPLICATION_ID} from "../../../sensitive_constants";

class BackendlessInitializer extends Component {
    constructor(props) {
        super(props);
        this.initBackendless = this.initBackendless.bind(this);
        this.state = {log: []};
    }

    log(message) {
        this.setState({log: [...this.state.log, message]});
    }


    componentDidMount() {
        if (document.getElementById("backendless") === null) {
            const script = document.createElement('script');
            script.id = "backendless";
            const url = (
                (window.location.protocol === 'file:') ? "http:" : window.location.protocol
            ) + "//api.backendless.com/sdk/js/latest/backendless.min.js";
            script.setAttribute('src', url);

            script.onload = () => {
                this.initBackendless();
            };
            script.onreadystatechange = () => {
                if (this.readyState === 'complete') this.onload()
            };
            document.body.appendChild(script);
        } else {
            this.log("Backendless seems initialized")
        }
    }

    initBackendless() {
        this.log("Backendless loaded");
        Backendless.serverURL = "https://api.backendless.com";
        Backendless.initApp(BACKENDLESS_APPLICATION_ID, BACKENDLESS_API_KEY);
        this.log("Backendless initialized");
    }

    render() {
        return (
            <div className='App-Card'>
                <h2>Notifications</h2>
                <div>
                    <p>Log</p>
                    <ul>
                        {this.state.log.map((message, index) => <li key={index}>{message}</li>)}
                    </ul>
                </div>
            </div>
        );
    }
}

export default BackendlessInitializer;
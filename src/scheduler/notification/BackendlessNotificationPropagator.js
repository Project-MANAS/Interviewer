/* global Backendless */
import React, {Component} from 'react';
import {BACKENDLESS_API_KEY, BACKENDLESS_APPLICATION_ID} from "../../sensitive_constants";

class BackendlessNotificationPropagator extends Component {
    constructor(props) {
        super(props);
        this.initBackendless = this.initBackendless.bind(this);


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
        }
    }

    initBackendless() {
        console.log("Backendless loaded");
        Backendless.serverURL = "https://api.backendless.com";
        Backendless.initApp(BACKENDLESS_APPLICATION_ID, BACKENDLESS_API_KEY);
    }

    render() {
        return null;
    }
}

export default BackendlessNotificationPropagator;
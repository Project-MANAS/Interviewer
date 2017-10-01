/* global Backendless */
/*global PublishOptions*/
/*global PublishOptionsHeaders*/
/*global android-ticker-text*/
/*global ANDROID_TICKER_TEXT_TAG*/
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
        var channel = "default",
            message = "Hello, world!",
            publishOptions = new Backendless.PublishOptions({
                headers: {
                    ANDROID_TICKER_TEXT_TAG: "Your just got a push notification lol",
                    ANDROID_CONTENT_TITLE_TAG: "This is a notification title",
                    ANDROID_CONTENT_TEXT_TAG: "Push notifications are cool"
                }
            });

        Backendless.Messaging.publish(channel, message, publishOptions)
            .then(function (messageStatus) {
                console.log("message has been published, message status - " + messageStatus.status);
            })
            .catch(function (error) {
                console.log("error - " + error.message);
            });

    }

    render() {
        return null;
    }
}

export default BackendlessNotificationPropagator;
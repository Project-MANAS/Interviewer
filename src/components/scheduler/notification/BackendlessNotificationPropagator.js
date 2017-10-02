/* global Backendless */
/*global PublishOptions*/
/*global PublishOptionsHeaders*/
import React, {Component} from 'react';
import {BACKENDLESS_API_KEY, BACKENDLESS_APPLICATION_ID} from "../../../sensitive_constants";

function UserTable() {
    this.registrationNumber = "";
    this.deviceToken = "";
}

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
        console.log("Backendless initialized");
        let regArray = ['140905506', '140905023', '140905506'];
        let deviceArray = [];
        regArray.forEach(function (regNum) {
            var whereClause = "registrationNumber = '"+regNum+"'";
            var queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(whereClause);
            let result = Backendless.Data.of(UserTable).findSync(queryBuilder);
            deviceArray.push(result[0].deviceToken);
        });

        /*
        Backendless.Data.of(UserTable).find(queryBuilder).then(function (result) {
            console.log(result[0].deviceToken);
        });
        */

        const channel = "default",
            message = "Hello, world ",
            publishOptions = new Backendless.PublishOptions({
                headers: {
                    'android-content-sound': "Home",
                    'android-ticker-text': "Your just got a push notification",
                    'android-content-title': "This is a notification title",
                    'android-content-text': "Push notifications are cool"
                }
            }),
            deliveryOptions = new Backendless.DeliveryOptions({
                pushSinglecast: deviceArray
            });

        const messageStatus = Backendless.Messaging.publishSync(channel,
            message,
            publishOptions,
            deliveryOptions);

    }

    render() {
        return null;
    }
}

export default BackendlessNotificationPropagator;
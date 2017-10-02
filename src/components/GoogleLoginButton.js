/* global gapi */
import React, {Component} from "react";

class GoogleLoginButton extends Component {

    constructor(props) {
        super(props);
        this.state = {isLogedIn: null, statusMsg: "Loading..."};
        this.initClient = this.initClient.bind(this);
        this.onSigninStatusChange = this.onSigninStatusChange.bind(this);
    }

    componentDidMount() {
        if (document.getElementById('gapi') === null) {
            const script = document.createElement("script");
            script.id = 'gapi';
            script.src = "https://apis.google.com/js/api.js";

            script.onload = () => {
                gapi.load('client:auth2', this.initClient);
            };
            script.onreadystatechange = () => {
                if (this.readyState === 'complete') this.onload()
            };
            document.body.appendChild(script);
        }
    }

    initClient() {
        gapi.client.init({
            apiKey: this.props.apiKey,
            clientId: this.props.clientId,
            discoveryDocs: this.props.discoveryDocs,
            scope: this.props.scope
        }).then(
            function () {
                // Listen for sign-in state changes.
                gapi.auth2.getAuthInstance().isSignedIn.listen(this.onSigninStatusChange);

                // Handle the initial sign-in state.
                this.onSigninStatusChange(gapi.auth2.getAuthInstance().isSignedIn.get());
            }.bind(this),
            function (response) {
                this.setState({statusMsg: "Failed to initialize Google API: " + response.error.message})
            }.bind(this)
        );
    }

    onSigninStatusChange(isSignedIn) {
        this.setState({isLogedIn: isSignedIn, statusMsg: null});
        this.props.onSigninStatusChange(isSignedIn);
    }

    render() {
        return (
            <div style={{overflow: 'hidden'}}>
                <p style={{fontWeight: 'bold'}}>Google</p>
                {
                    this.state.isLogedIn !== undefined && this.state.isLogedIn !== null && (
                        <div>
                            <button id="authorize-button" className='login'
                                    style={{display: this.state.isLogedIn ? 'none' : 'block', padding: '4px 16px'}}
                                    onClick={() => gapi.auth2.getAuthInstance().signIn()}>
                                LOGIN
                            </button>
                            <button id="signout-button" className='sign_out'
                                    style={{display: this.state.isLogedIn ? 'inline-block' : 'none'}}
                                    onClick={() => gapi.auth2.getAuthInstance().signOut()}>
                                SIGN OUT
                            </button>
                        </div>
                    )
                }
                {
                    this.state.statusMsg &&
                    <p className='loading' style={{display: 'block', margin: '8px', padding: '4px 16px'}}>
                        {this.state.statusMsg}
                    </p>
                }
            </div>
        );
    }

}

export default GoogleLoginButton;
/* global gapi */
import ConditionalDisplay from "./ConditionalDisplay";
import GoogleLoginButton from "./GoogleLoginButton";
import InterviewerSignIn from "./InterviewerSignin";
import React, {Component} from "react";
import ProfileInfo from "./ProfileInfo";

class ProfileHeader extends Component {
    constructor(props) {
        super(props);

        this.state = {isSignedInToGoogle: false, isInterviewerSignedIn: false, interviewerProfile: null};
        this.updateGoogleSigninStatus = this.updateGoogleSigninStatus.bind(this);
        this.onInterviewerSigninStatusChange = this.onInterviewerSigninStatusChange.bind(this);
    }

    updateGoogleSigninStatus(isSignedIn) {
        this.setState({
            isSignedInToGoogle: isSignedIn
        });
    }

    onInterviewerSigninStatusChange(isInterviewerSignedIn, interviewerProfile) {
        this.setState({isInterviewerSignedIn, interviewerProfile});
        this.props.onSigninStatusChange(isInterviewerSignedIn, interviewerProfile);
    }

    render() {
        return (
            <table style={{color: 'black'}}>
                <tr>
                    <ConditionalDisplay style={{display: 'inline-block'}} condition={this.state.isSignedInToGoogle}>
                        <div style={{display: 'inline-block'}}>
                            <ProfileInfo style={{display: 'inline-block'}}
                                         interviewerProfile={this.state.interviewerProfile}/>
                            <InterviewerSignIn onSigninStatusChange={this.onInterviewerSigninStatusChange}/>
                        </div>
                    </ConditionalDisplay>
                    <div style={{display: 'inline-block', float: 'right'}}>
                        <GoogleLoginButton onSigninStatusChange={this.updateGoogleSigninStatus}
                                           apiKey={this.props.apiKey} clientId={this.props.clientId}
                                           discoveryDocs={this.props.discoveryDocs} scope={this.props.scope}/>
                    </div>
                </tr>
            </table>

        );

    }
}

export default ProfileHeader;
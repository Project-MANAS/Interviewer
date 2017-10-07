import GoogleLoginButton from "./GoogleLoginButton";
import InterviewerSignIn from "./interviewer/InterviewerSignin";
import React, {Component} from "react";
import ProfileInfo from "./ProfileInfo";
import '../App.css';

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
            <div className="App-Elevated" style={{color: 'black', fontSize: '20px', background: 'lemonchiffon', height: '100%', box-shadow: '0px'}}>
                <div>
                    {
                        this.state.isSignedInToGoogle &&
                        <div style={{display: 'inline-block'}}>
                            <ProfileInfo style={{display: 'inline-block'}}
                                         interviewerProfile={this.state.interviewerProfile}/>
                        </div>
                    }
                    <div style={{display: 'inline-block', float: 'right'}}>
                        <GoogleLoginButton onSigninStatusChange={this.updateGoogleSigninStatus}
                                           apiKey={this.props.apiKey} clientId={this.props.clientId}
                                           discoveryDocs={this.props.discoveryDocs} scope={this.props.scope}/>
                    </div>
                </div>
                {
                    this.state.isSignedInToGoogle &&
                    <InterviewerSignIn onSigninStatusChange={this.onInterviewerSigninStatusChange}/>
                }
            </div>

        );

    }
}

export default ProfileHeader;
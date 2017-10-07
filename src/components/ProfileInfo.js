import React, {Component} from 'react';
import '../App.css';

class ProfileInfo extends Component {
    render() {
        let interviewerProfile = this.props.interviewerProfile;
        return (
            interviewerProfile &&
            <div style={{overflow: 'hidden'}}>
                <table style={{display: 'block-inline', float: 'left', margin: '8px'}}>
                    <tbody>
                    <tr style={{margin: '8px'}}>
                        <td>Name:</td>
                        <td>{interviewerProfile.googleProfile.getName()}</td>
                    </tr>
                    <tr style={{margin: '8px'}}>
                        <td>Email:</td>
                        <td>{interviewerProfile.googleProfile.getEmail()}</td>
                    </tr>
                    <tr>
                        <td>Division:</td>
                        <td>{interviewerProfile.division || 'Unknown'}</td>
                    </tr>
                    <td>
                        <tr>

                        </tr>
                    </td>
                    </tbody>
                </table>
                <img className="profilePic" style={{float: 'right', margin: '8px', height: '75px'}}
                     src={interviewerProfile.googleProfile.getImageUrl()}
                     alt='Google Profile'/>
            </div>

        );
    }
}

export default ProfileInfo;
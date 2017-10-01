import React, {Component} from 'react';

class ProfileInfo extends Component {
    render() {
        let interviewerProfile = this.props.interviewerProfile;
        return (
            interviewerProfile &&
            <table>
                <tbody>
                <td>
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
                </td>
                <td>
                    <tr style={{float: 'left', margin: '8px'}}>
                        <img style={{height: '64px'}}
                             src={interviewerProfile.googleProfile.getImageUrl()}
                             alt='Google Profile'/>
                    </tr>
                </td>
                </tbody>
            </table>
        );
    }
}

export default ProfileInfo;
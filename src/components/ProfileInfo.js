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
<<<<<<< HEAD
                </td>
                <td>
                    <tr className="profilePic" style={{float: 'left', margin: '8px'}}>
                        <img style={{height: '75px'}}
                             src={interviewerProfile.googleProfile.getImageUrl()}
                             alt='Google Profile'/>
                    </tr>
                </td>
                </tbody>
            </table>
=======
                    </tbody>
                </table>
                <img style={{display: 'block-inline', float: 'right', margin: '8px', height: '64px'}}
                     src={interviewerProfile.googleProfile.getImageUrl()}
                     alt='Google Profile'/>
            </div>
>>>>>>> 77e4c53918d4a811873577e9e6b34fac9acc992f
        );
    }
}

export default ProfileInfo;
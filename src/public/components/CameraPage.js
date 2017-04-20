import React from 'react';
import Webcam from 'react-webcam';
import keydown, { Keys } from 'react-keydown';
import { queryGallery } from './requests/gallery';
import Select from 'react-select';
import Spinner from './Spinner';
import Moment from 'moment';


export default class CameraPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      spinner: false,
      checkedinUser: null,
      count: 0
    };

    this.takeScreenshot = this.takeScreenshot.bind(this);
    this.startCamera = this.startCamera.bind(this);
  }

  componentWillMount() {
    this.setState({ mounted: true });
  }

  componentWillUnmount() {
    this.setState({ mounted: false });
  }

  async takeScreenshot() {
    const screenshot = this.refs.webcam.getScreenshot();
    this.setState({ spinner: true });
    console.log( await queryGallery(screenshot) );
    this.setState({ spinner: false, checkedinUser: 'hardcoded guy checked in' });
  }

  startCamera() {
    let endTime = Moment().add(1, 'minute');
    let startTimer = setInterval(()=>{
      let startTime = Moment();

      if (startTime.format('h:mm') === endTime.format('h:mm')) {

        clearInterval(startTimer);
      }
      this.takeScreenshot();
    }, 5000)
  }

  render() {
    return (
      <div>

        { this.state.mounted && <div><Webcam ref='webcam'/></div> }

        <h1> Screenshots </h1>
        
        <div>
          <button className="screenShotButton" onClick={this.takeScreenshot}>Take Screenshot</button>
          <button className="startCamera" onClick={this.startCamera}>Start Camera</button>
        </div>

        {this.state.spinner && <Spinner/>}
        {this.state.checkedinUser}

      </div>
    );
  }
}

import React from 'react';

class Toggle extends React.Component {
    
  constructor(props) {
    super(props);
    this.isMotionOn = this.props.isMotionOn;
    this.setMotion = this.props.setMotion;
  }

  render() {
    return (
      <div className='width-100-percent mt-20 responsiveTopMargin'>
        <div className="greet color-red p-5">Motion</div>
        <button  className="button-red" onClick={this.props.setMotion}>
          {this.props.isMotionOn ? 'ON' : 'OFF'}
        </button>
      </div>
    );
  }
}
export default Toggle;
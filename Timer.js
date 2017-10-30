import React, { Component } from 'react';
import PropTypes from 'prop-types';

function Circle(props) {
  //console.log('Arc props: ' + props.arcParams);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
      <defs>
        <filter id="sofGlow" height="300%" width="300%" x="-75%" y="-75%">
          <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="thicken" />
          <feGaussianBlur in="thicken" stdDeviation="14" result="blurred" />
          <feFlood floodColor="#61FBFC" result="glowColor" />
          <feComposite in="glowColor" in2="blurred" operator="in" result="softGlow_colored" />
          <feMerge>
            <feMergeNode in="softGlow_colored"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g x="0" y="0">
      <path id="arc1"  d={props.arcParams} fill="none" stroke="#61FBFC" strokeWidth="6" filter="url(#sofGlow)" />
      </g>
    </svg>
  );
}

export default class Timer extends Component {
  static defaultProps = {
    title: 'Timer'
  };

  static propTypes = {
    initialTime: React.PropTypes.number.isRequired,
    completeCallback: React.PropTypes.func,
    bgColor: React.PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      currentTime: new Date(),
      arcParams: "M 150.01745329243136 50.00000152308709 A 100 100 0 0 0 150.01745329243136 50.00000152308709",
      minutesLeft: this.props.initialTime < 10 ? '0' + this.props.initialTime: this.props.initialTime,
      secondsLeft: "00",
      timeLeft: this.props.initialTime * 1000 * 60,
    };
    
    this.startTimer = this.startTimer.bind(this);
    this.playStartAnimation = this.playStartAnimation.bind(this);
    this.playCountdownAnimation = this.playCountdownAnimation.bind(this);
    this.tickAnimation = this.tickAnimation.bind(this);
    this.playCountdownClock = this.playCountdownClock.bind(this);
    this.setInitialTime = this.setInitialTime.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    this.startTimer();
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
    clearInterval(this.downTimerID);
    this._isMounted = false;
  }

  setInitialTime() {
    if (this._isMounted) {
      this.setState((prevState, props) => {
        return { minutesLeft: this.props.initialTime < 10 ? '0' + this.props.initialTime: this.props.initialTime };
      });
    }
  }

  startTimer() {
    clearInterval(this.timerID);
    clearInterval(this.downTimerID);
    this.setInitialTime();
    this.playStartAnimation(2)
      .then(() => {
        return new Promise((resolve, reject) => {
          this.playCountdownClock(this.props.initialTime * 1);
          this.playCountdownAnimation(this.props.initialTime * 60).then(() => {
            resolve(true);
          });
        });
      })
      .then(() => {
        if (this.props.completeCallback) {
          this.props.completeCallback();
        }
      });
  }

  playStartAnimation(durationSec) {
    console.info('=== playing start animation ===');
    return new Promise(resolve => {
      let iter = 0;
      const durationMillisec = durationSec * 1000;
      let lastTick = Date.now();
      const tickInterval = durationMillisec / 359.9;

      this.timerID = setInterval(() => {
        if (iter <= 359.9) {
          iter++;
          this.tickAnimation(iter);
        } else {
          clearInterval(this.timerID);
          resolve(true);
        }
      }, tickInterval);
    });
  }

  playCountdownAnimation(durationSec) {
    console.info('=== playing countdown animation ===');
    return new Promise(resolve => {
      let iter = 359.9;
      const durationMillisec = durationSec * 1000;
      let lastTick = Date.now();
      const tickInterval = durationMillisec / 359.9;

      this.downTimerID = setInterval(() => {
        if (iter >= 0) {
          iter--;
          this.tickAnimation(iter);
        } else {
          clearInterval(this.downTimerID);
          resolve(true);
        }
      }, tickInterval);
    });
  }

  playCountdownClock(durationMin) {
    if (this._isMounted) {
      let nTimeLeft = durationMin * 60000;
      this.clocktimerID = setInterval(() => {
        if (nTimeLeft <= 0) {
          clearInterval(this.clocktimerID);
        } else {
          nTimeLeft = nTimeLeft - 1000;

          let totalSeconds = Math.round(nTimeLeft / 1000);
          let seconds = parseInt(totalSeconds % 60, 10);
          let minutes = parseInt(totalSeconds / 60, 10) % 60;

          seconds = seconds < 10 ? '0' + seconds : seconds;
          minutes = minutes < 10 ? '0' + minutes : minutes;

          this.setState((prevState, props) => {
            return { timeLeft: nTimeLeft };
          });
          this.setState((prevState, props) => {
            return { minutesLeft: minutes };
          });
          this.setState((prevState, props) => {
            return { secondsLeft: seconds };
          });
        }
      }, 1000);
    }
  }

  tickAnimation(angle) {
    if (this._isMounted) {
      this.setState((prevState, props) => {
        return { arcParams: this.describeArc(150, 150, 100, 0.01, angle) };
      });
    }
  }

  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    let angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  describeArc(x, y, radius, startAngle, endAngle) {
    let start = this.polarToCartesian(x, y, radius, endAngle);
    let end = this.polarToCartesian(x, y, radius, startAngle);
    let largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    let d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;
  }



  render() {
    const timerStyle = {
      width: '200px',
      height: '200px',
      top: '200px',
      left: '100px',
      backgroundColor: this.props.bgColor
    };
    const timeIndicatorStyle = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      left: '0',
      right: '0',
      color: '#DCEDF5',
      textAlign: 'center',
      fontSize: '1em',
      fontWeight: 'bold'
    };
    const wrapperStyle = {
      position: 'relative',
      display: 'block'
    };
    return (
      <div className="timer" style={timerStyle}>
        <div className="wrapper" style={wrapperStyle}>
          <Circle arcParams={this.state.arcParams} />
          <div className="time-left" style={timeIndicatorStyle}>
            <span className="minutes">{this.state.minutesLeft}</span>
            <span> : </span>
            <span className="seconds">{this.state.secondsLeft}</span>
          </div>
        </div>
      </div>
    );
  }
}


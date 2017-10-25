import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: new Date(),
      arcParams: ""
    };
    this.start = this.start.bind(this);
    this.playStartAnimation = this.playStartAnimation.bind(this);
    this.tick = this.tick.bind(this);
  }

  static propTypes = {
    initialTime: React.PropTypes.number.isRequired,
    completeCallback: React.PropTypes.func
  }
 
  static defaultProps = {
    model: {
      id: 0
    },
    title: 'Your Name'
  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  start() {
    this.playStartAnimation();
  }

  playStartAnimation() {

  }

  tick() {
    this.setState({arcParams: this.describeArc(150, 150, 100, 130, 360)});
  }

  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    let angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  describeArc(x, y, radius, startAngle, endAngle) {
    let start = polarToCartesian(x, y, radius, endAngle);
    let end = polarToCartesian(x, y, radius, startAngle);
    let largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    let d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;       
  }

  render() {
    return (
      <div className="hm-timer">
        <svg>
          <defs>
            <filter id="sofGlow" height="200%" width="200%" x="-75%" y="-75%">
              <!-- Thicken out the original shape -->
              <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="thicken" />

              <!-- Use a gaussian blur to create the soft blurriness of the glow -->
              <feGaussianBlur in="thicken" stdDeviation="14" result="blurred" />

              <!-- Change the colour -->
              <feFlood flood-color="#446688" result="glowColor" />

              <!-- Color in the glows -->
              <feComposite in="glowColor" in2="blurred" operator="in" result="softGlow_colored" />

              <!--	Layer the effects together -->
              <feMerge>
                <feMergeNode in="softGlow_colored"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path id="arc1" d={this.state.arcParams} fill="none" stroke="#446688" stroke-width="6" filter="url(#sofGlow)" />
        </svg>
        <div className="time-left">
          <span className="minutes"></span>
        </div>
      </div>
    );
  }
}
import React from 'react';
import PropTypes from 'prop-types';
import ReactSvg from '../images/react.svg'


class FancyRankItem extends React.PureComponent {
  static propTypes = {
    top: PropTypes.number,
    number: PropTypes.number,
    teamName: PropTypes.string,
    problems: PropTypes.arrayOf(PropTypes.shape({
      accepted: PropTypes.number,
      total: PropTypes.number,
      hasChange: PropTypes.bool,      // 是否有变化
      timeuse: PropTypes.number,      // 单位：秒(s)
    })),
    solved: PropTypes.number,
    timeUsed: PropTypes.number,
  };

  static defaultProps = {};

  state = {};

  render() {
    return <div
      className="fancy-rank-item"
      style={{ top: this.props.top }}
    >
      <div className="rank-item-number">{this.props.number}</div>
      <div className="rank-item-logo">
        <img src={ReactSvg} width={80} height={80} alt="react" />
      </div>
      <div className="rank-item-content">
        <div className="rank-item-content-team-name">
          {this.props.teamName}
        </div>
        <div className="rank-item-content-problems">
          <div className="rank-item-content-problems-tag">A</div>
          <div className="rank-item-content-problems-tag accepted">233</div>
          <div className="rank-item-content-problems-tag failed">-5</div>
          <div className="rank-item-content-problems-tag changed">-7</div>
          <div className="rank-item-content-problems-tag">E</div>
          <div className="rank-item-content-problems-tag">F</div>
          <div className="rank-item-content-problems-tag">G</div>
        </div>
      </div>
      <div className="rank-item-solved">
        {this.props.solved}
      </div>
      <div className="rank-item-times">
        {this.props.timeUsed}
      </div>
    </div>;
  }
}

export default FancyRankItem;

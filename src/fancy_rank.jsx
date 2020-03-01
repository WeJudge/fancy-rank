import React from 'react';
import PropTypes from 'prop-types';
import faker from 'faker';
import './styles/fancy-rank.scss';
import FancyRankItem from './components/item';

class FancyRank extends React.PureComponent {
  static propTypes = {};
  static defaultProps = {};
  state = {};

  render() {
    const items = Array.call(null, ...Array(24)).map((_, h) => h);
    return <div className="fancy-rank">
      <div className="fancy-rank-header">
        <div className="fancy-rank-header-item rank">排名</div>
        <div className="fancy-rank-header-item fill" />
        <div className="fancy-rank-header-item solved">解题</div>
        <div className="fancy-rank-header-item time">时间</div>
      </div>
      <div className="fancy-rank-warp">
        {items.map((i) => {
          return <FancyRankItem
            key={i}
            top={i * 80}
            number={i + 1}
            teamName={faker.name.findName()}
            solved={faker.random.number({min: 0, max: 6})}
            timeUsed={faker.random.number({min: 0, max: 999})}
          />;
        })}
      </div>
    </div>;
  }
}

export default FancyRank;

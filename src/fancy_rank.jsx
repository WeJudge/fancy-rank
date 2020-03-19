import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import resp from './data.json';
import './styles/fancy-rank.scss';
import FancyRankItem from './components/item';

const ITEM_COMMON_HEIGHT = 80;

class FancyRank extends React.Component {
  static propTypes = {
    fancyRankData: PropTypes.shape({})
  };
  static defaultProps = {
    fancyRankData: resp.data,
  };

  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
      ...this.initState(),
    };
    console.log(this.state);
  }

  state = {

  };

  initState = () => {
    const rankListRaw = JSON.parse(JSON.stringify(get(this.props.fancyRankData, 'ranklist', [])));
    const problemListRaw = JSON.parse(JSON.stringify(get(this.props.fancyRankData, 'problems', [])));
    const rankList = [];
    const accountInfos = {};
    const problems = [];
    const problemInfos = {};
    // 执行normalizr操作
    rankListRaw.forEach((item) => {
      const accountId = get(item, 'account.id');
      rankList.push(accountId);
      accountInfos[accountId] = item;
    });
    problemListRaw.sort((a, b) => a.order > b.order);
    problemListRaw.forEach((item) => {
      const problemId = get(item, 'problem_id');
      problems.push(problemId);
      problemInfos[problemId] = item;
    });
    return {
      rankList,
      accountInfos,
      problems,
      problemInfos,
      currentIndex: 0,
    }
  };

  setPosition = (from, to) => {
    const { indexMapping } = this.state;


  };

  render() {
    return <div className="fancy-rank">
      <div className="fancy-rank-header">
        <div className="fancy-rank-header-item rank">排名</div>
        <div className="fancy-rank-header-item fill" />
        <div className="fancy-rank-header-item solved">解题</div>
        <div className="fancy-rank-header-item time">时间</div>
      </div>
      <div className="fancy-rank-warp">
        {this.state.rankList.map((accountId, index) => {
          return <FancyRankItem
            key={accountId}
            top={index * ITEM_COMMON_HEIGHT}
            number={index + 1}
            problems={this.state.problems}
            problemInfos={this.state.problemInfos}
            accountInfo={this.state.accountInfos[accountId]}
          />;
        })}
      </div>
    </div>;
  }
}

export default FancyRank;

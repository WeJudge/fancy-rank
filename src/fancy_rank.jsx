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
    console.log(this.state, this.props.fancyRankData);
  }

  state = {

  };

  initState = () => {
    const rankListRaw = JSON.parse(JSON.stringify(get(this.props.fancyRankData, 'ranklist', [])));
    const problemListRaw = JSON.parse(JSON.stringify(get(this.props.fancyRankData, 'problems', [])));
    const diffSolutionsRaw = JSON.parse(JSON.stringify(get(this.props.fancyRankData, 'diff_solutions', {})));
    const rankList = [];
    const accountInfos = {};
    const problems = [];
    const problemInfos = {};
    const rollingStatus = {};   // { accountId: { problemId: true } }
    // 执行normalizr操作
    rankListRaw.forEach((item) => {
      const accountId = get(item, 'account.id');
      const diffSolutions = get(diffSolutionsRaw, `${accountId}`, {});
      rankList.push(accountId);
      accountInfos[accountId] = item;
      rollingStatus[accountId] = {};
      Object.keys(diffSolutions).forEach((pid) => {
        rollingStatus[accountId][pid] = 0;
      })
    });
    problemListRaw.sort((a, b) => a.order - b.order);
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
      rollingStatus,
      diffSolutionsRaw,
      currentIndex: 0,
    }
  };

  setPosition = (fromIndex, toIndex) => {
    const { rankList } = this.state;
    if (fromIndex >= rankList.length || toIndex >= rankList.length || fromIndex <= toIndex) {
      return;
    }
    const target = rankList[fromIndex];
    for (let i = fromIndex; i > toIndex; i--) {
      rankList[i] = rankList[i - 1];
    }
    rankList[toIndex] = target;
    this.setState({
      rankList,
    })
  };

  componentDidMount() {
    setTimeout(() => {
      this.setPosition(15, 0)
    }, 3000)
  }

  render() {
    return <div className="fancy-rank">
      <div className="fancy-rank-header">
        <div className="fancy-rank-header-item rank">排名</div>
        <div className="fancy-rank-header-item fill_logo" />
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
            diffSolutions={this.state.diffSolutionsRaw[accountId]}
            rollingStatus={this.state.rollingStatus[accountId]}
          />;
        })}
      </div>
    </div>;
  }
}

export default FancyRank;

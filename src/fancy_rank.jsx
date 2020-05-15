import React from 'react';
import PropTypes from 'prop-types';
import {
  PlayCircleFilled,
  PauseCircleFilled,
  CaretLeftFilled,
  CaretRightFilled,
  UndoOutlined
} from '@ant-design/icons';
import { get, has } from 'lodash';
import resp from './data.json';
import './styles/fancy-rank.scss';
import FancyRankItem from './components/item';

const ITEM_COMMON_HEIGHT = 80;
const COMMON_WAIT_TIME = 2 * 1000;
const ROLLING_NEXT_DURATION = 2 * 1000;

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
      currentIndex: -1,
      currentProblemIndex: -1,
      playing: false,             // 播放状态
      ...this.initState(),
    };
    console.log(this.state, this.props.fancyRankData);
  }

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
      const diffSolutions = get(diffSolutionsRaw, accountId, {});
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
      currentIndex: rankList.length,
      currentProblemIndex: -1,
    }
  };

  rollingWorker = null;
  hadMove = false;      // 如果有移动过项，会选中这个，防止pindex == 1时自动currentIndex - 1
  playStack = [];       // 播放栈

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
    window.addEventListener('keydown', this.handleKeyBoardEvent);
    window.addEventListener('beforeunload', this.handleBeforeUnload)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyBoardEvent);
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
  }

  cleanWorker = () => {
    if (this.rollingWorker) {
      clearTimeout(this.rollingWorker);
      this.rollingWorker = null;
    }
  };

  handleBeforeUnload = (e) => {
    if (this.state.playing) {
      e.stopPropagation();
      e.returnValue = false;
      return false
    }
  };

  handleKeyBoardEvent = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.code === 'Space') {
      this.toggleRunning();
    }
  };

  toggleRunning = () => {
    if (this.state.playing) {
      this.setState({
        playing: false,
      });
      this.cleanWorker();
      console.log("Pause");
    } else {
      this.cleanWorker();
      this.setState({
        playing: true,
      }, () => {
        this.scrollToCurrent();
        this.rollingWorker = setTimeout(this.rollingWorkerFunc, ROLLING_NEXT_DURATION);
      });
      console.log("Start");
    }
  };

  findNextSolution = () => {
    const {
      problems,
      rankList,
      diffSolutionsRaw,
      currentIndex,
      rollingStatus,
      currentProblemIndex
    } = this.state;
    let pindex = currentProblemIndex;
    let cindex = currentIndex;
    if (!this.hadMove && pindex === -1) {
      cindex--;
    }
    this.hadMove = false;
    while(cindex >= 0) {
      const accountId = rankList[cindex];
      const solutions = get(diffSolutionsRaw, accountId, null) || {};
      while (++pindex < problems.length) {
        const pid = problems[pindex];
        // 找有diff的并且是没有移动过的
        if (has(solutions, pid) && get(rollingStatus, `${accountId}.${pid}`, 0) === 0) {
          return {
            emptyLine: false,
            solution: solutions[pid],
            pindex,
            cindex,
          }
        }
      }
      pindex = -1;
      return {
        emptyLine: true,
        pindex,
        cindex,
      }
    }
    return null;
  };

  findSortTarget = (accountId) => {
    const { rankList, accountInfos } = this.state;
    const tinfo = accountInfos[accountId];
    for (let i = 0; i < rankList.length; i++) {
      const aid = rankList[i];
      const sinfo = accountInfos[aid];
      // 如果解题数少了，直接返回当前i
      if (sinfo.solved < tinfo.solved) {
        return i;
      } else if (sinfo.solved === tinfo.solved) {
        // 解题相等的时候，比较时间
        if (sinfo.time_used > tinfo.time_used) {
          return i;
        }
      }
    }
    return -1;
  };

  scrollToCurrent = (cindex) => {
    const top = ITEM_COMMON_HEIGHT * ((cindex || this.state.currentIndex) - 5);
    this.scrollToTarget(top > 0 ? top : 0);
  };

  rollingWorkerFunc = () => {
    // 1: 找到对应的rollingStatus
    // 2: 标记rollingStatus
    // 3：记录堆栈
    if (!this.state.playing) return;
    const positionResult = this.findNextSolution();
    if (positionResult) {
      if (positionResult.emptyLine) {
        this.setState({
          currentIndex: positionResult.cindex,
          currentProblemIndex: positionResult.pindex,
        });
        this.scrollToCurrent(positionResult.cindex);
        this.rollingWorker = setTimeout(this.rollingWorkerFunc, ROLLING_NEXT_DURATION);
        return;
      }
      // 入栈
      this.playStack.push(positionResult);
      const { rollingStatus, rankList, problems, accountInfos } = this.state;
      const accountId = rankList[positionResult.cindex];
      const problemId = problems[positionResult.pindex];
      rollingStatus[accountId][problemId] = 1;
      this.setState({
        currentIndex: positionResult.cindex,
        currentProblemIndex: positionResult.pindex,
        rollingStatus,
      }, () =>{
        this.scrollToCurrent(positionResult.cindex);
        // pending闪烁2秒
        setTimeout(() => {
          rollingStatus[accountId][problemId] = 2;
          this.setState({
            rollingStatus,
          }, () => {
            if (positionResult.solution.accepted > 0) {
              // 向栈顶写入动作状态
              this.playStack[this.playStack.length - 1].isAc = true;
              // 绿了！
              const info = accountInfos[accountId];
              info['solved'] += 1;
              info['time_used'] += get(positionResult, 'solution.time_used', 0);
              accountInfos[accountId] = info;
              this.setState({
                accountInfos,
              }, () => {
                const tindex = this.findSortTarget(accountId);
                // 向栈顶写入目标地址
                this.playStack[this.playStack.length - 1].tindex = tindex;
                if (tindex > -1) {
                  // 如果需要移动
                  this.setState({
                    currentProblemIndex: -1,      // 回退标记
                  }, () => {
                    // 飞上去
                    this.setPosition(positionResult.cindex, tindex);
                    this.hadMove = true;
                  })
                } else {
                  // 询问下一个
                  this.rollingWorker = setTimeout(this.rollingWorkerFunc, ROLLING_NEXT_DURATION);
                }
              })
            } else {
              // 向栈顶写入动作状态
              this.playStack[this.playStack.length - 1].isAc = false;
              this.rollingWorker = setTimeout(this.rollingWorkerFunc, ROLLING_NEXT_DURATION);
            }
          });
        }, COMMON_WAIT_TIME);
      });
    }
  };


  scrollToTarget = (top) => {
    window.jQuery('#fancy-rank-scroll-warp').scrollTo(top, 500)
  };

  handleTransitionEnd = () => {
    this.rollingWorker = setTimeout(this.rollingWorkerFunc, ROLLING_NEXT_DURATION);
  };

  render() {
    return <div className="fancy-rank">
      <div className="fancy-rank-header">
        <div className="fancy-rank-header-item rank">排名</div>
        <div className="fancy-rank-header-item fill_logo" />
        <div className="fancy-rank-header-item fill" />
        <div className="fancy-rank-header-item solved">解题</div>
        <div className="fancy-rank-header-item time">时间</div>
      </div>
      <div className="fancy-rank-warp" id="fancy-rank-scroll-warp">
        {this.state.rankList.map((accountId, index) => {
          return <FancyRankItem
            key={accountId}
            top={index * ITEM_COMMON_HEIGHT}
            number={index + 1}
            isCurrent={index === this.state.currentIndex}
            problems={this.state.problems}
            problemInfos={this.state.problemInfos}
            accountInfo={this.state.accountInfos[accountId]}
            diffSolutions={this.state.diffSolutionsRaw[accountId]}
            rollingStatus={this.state.rollingStatus[accountId]}
            transitionEnd={this.handleTransitionEnd}
          />;
        })}
        <div className="fancy-rank-placebottom" style={{ top: `${ITEM_COMMON_HEIGHT * this.state.rankList.length}px` }} />
      </div>
      <div className="fancy-rank-control">
        <div className="button">
          <CaretLeftFilled />
        </div>
        <div className="button" onClick={this.toggleRunning}>
          {this.state.playing ? <PauseCircleFilled /> : <PlayCircleFilled />}
        </div>
        <div className="button">
          <CaretRightFilled />
        </div>
      </div>
    </div>;
  }
}

export default FancyRank;

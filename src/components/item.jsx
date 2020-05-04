import React from 'react';
import { Avatar } from 'antd';
import { get } from 'lodash';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { UserOutlined } from '@ant-design/icons';

export const indexToChar = (index) => {
  const indexParsed = parseInt(index, 10);
  return (indexParsed > 0 && indexParsed <= 26) ?
    String.fromCharCode(65 + (indexParsed - 1)) : '-';
};

class FancyRankItem extends React.Component {
  static propTypes = {
    top: PropTypes.number,
    number: PropTypes.number,
    problems: PropTypes.arrayOf(PropTypes.string),
    problemInfos: PropTypes.shape({}),
    accountInfo: PropTypes.shape({}),
    diffSolutions: PropTypes.shape({}),   // Solution变化数据
    rollingStatus: PropTypes.shape({}),   // 滚榜判定情况
  };

  static defaultProps = {};

  static getDerivedStateFromProps (nextProps, prevState) {
    const { accountInfo, problems, problemInfos, rollingStatus, diffSolutions } = nextProps;
    let solved = 0;
    let totalUsedTime = 0;
    problems.map((pid) => {
      const hasNewStatus = rollingStatus.hasOwnProperty(pid);
      const hasStatus = get(accountInfo, 'solutions', {}).hasOwnProperty(pid);
      let accepted = 0, timeUsed = 0;
      if (hasNewStatus) {
        // 有diff记录的时候用diff里边的时间
        accepted = get(diffSolutions, `${pid}.accepted`, 0);
        timeUsed = get(diffSolutions, `${pid}.time_used`, 0);
        if (rollingStatus[pid] === 2) {
          // 滚动过，只有过题了才记录时间
          solved += (accepted > 0 ? 1 : 0);
          totalUsedTime += (accepted > 0 ? timeUsed : 0);
        }
      } else {
        // 否则用account里边的时间
        if (hasStatus) {
          accepted = get(accountInfo, `solutions.${pid}.accepted`, 0);
          timeUsed = get(accountInfo, `solutions.${pid}.time_used`, 0);
          solved += (accepted > 0 ? 1 : 0);
          totalUsedTime += (accepted > 0 ? timeUsed : 0);
        }
      }
    });
    return {
      solved,
      totalUsedTime
    }
  }

  state = {
    solved: 0,
    totalUsedTime: 0,
  };

  render() {
    const { accountInfo, problems, problemInfos, rollingStatus, diffSolutions } = this.props;
    return <div
      className="fancy-rank-item"
      style={{ top: this.props.top }}
    >
      <div className="rank-item-number">{this.props.number}</div>
      <div className="rank-item-logo">
        <Avatar shape="circle" icon={<UserOutlined />} size={64} />
      </div>
      <div className="rank-item-content">
        <div className="rank-item-content-team-name">
          {get(accountInfo, 'account.nickname')}
        </div>
        <div className="rank-item-content-problems">
          {problems.map((pid) => {
            const hasNewStatus = rollingStatus.hasOwnProperty(pid);     // 是否有diff记录
            const problem = problemInfos[pid];

            let submission = 0, accepted = 0, lastSubmitTime = 0;
            if (hasNewStatus) {
              // 有diff记录的时候用diff里边的时间
              submission = get(diffSolutions, `${pid}.submission`, 0);
              accepted = get(diffSolutions, `${pid}.accepted`, 0);
              lastSubmitTime = Math.floor(get(diffSolutions, `${pid}.last_submit_time`, 0) / 60);
            } else {
              // 否则用account里边的时间
              submission = get(accountInfo, `solutions.${pid}.submission`, 0);
              accepted = get(accountInfo, `solutions.${pid}.accepted`, 0);
              lastSubmitTime = Math.floor(get(accountInfo, `solutions.${pid}.last_submit_time`, 0) / 60);
            }

            const isAccepted = accepted > 0;
            const hasSubmitted = submission > 0;
            // 颜色设置
            const classMapping = {};
            if (hasNewStatus) {
              if (rollingStatus[pid] === 2) {
                // 有滚动过
                classMapping['accepted'] = isAccepted;
                classMapping['failed'] = hasSubmitted && !isAccepted;
              } else if (rollingStatus[pid] === 1) {
                // 滚动中
                classMapping['pending'] = true;
              } else {
                // 没有滚动过
                classMapping['changed'] = true;
              }
            } else {
              classMapping['accepted'] = isAccepted;
              classMapping['failed'] = hasSubmitted && !isAccepted;
            }
            // 文本设置
            const buildText = () => {
              if (submission > 1) {
                return `${submission} - ${lastSubmitTime}`;
              } else if (submission === 1) {
                return `${lastSubmitTime}`;
              } else {
                return indexToChar(get(problem, 'order', 0))
              }
            };
            return <div key={pid} className={classnames("rank-item-content-problems-tag", classMapping)}>
              {buildText()}
            </div>;
          })}
        </div>
      </div>
      <div className="rank-item-solved">
        <span>{this.state.solved}</span>
      </div>
      <div className="rank-item-times">
        <span>{(this.state.totalUsedTime / 60).toFixed(0)}</span>
      </div>
    </div>;
  }
}

export default FancyRankItem;

import React from 'react';
import { Avatar, Icon } from 'antd';
import { get } from 'lodash';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { UserOutlined } from '@ant-design/icons';
import ReactSvg from '../images/react.svg'

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
  };

  static defaultProps = {};

  state = {};

  render() {
    const { accountInfo, problems, problemInfos } = this.props;
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
            const problem = problemInfos[pid];
            const submission = get(accountInfo, `solutions.${pid}.submission`, 0);
            const accepted = get(accountInfo, `solutions.${pid}.accepted`, 0);
            const penalty = get(accountInfo, `solutions.${pid}.penalty`, 0);
            const timeUsed = (get(accountInfo, `solutions.${pid}.time_used`, 0) / 60).toFixed(0);
            const isAccepted = accepted > 0;
            const hasSubmitted = submission > 0;
            const classMapping = {
              accepted: isAccepted,
              failed: hasSubmitted && !isAccepted,
            };
            const buildText = () => {
              if (classMapping.accepted) {
                return `${penalty} - ${ timeUsed}`;
              } else if (classMapping.failed) {
                return `${penalty}`;
              }
              return indexToChar(get(problem, 'order', 0))
            };
            return <div className={classnames("rank-item-content-problems-tag", classMapping)}>
              {buildText()}
            </div>;
          })}
          {/*<div className="rank-item-content-problems-tag">A</div>*/}
          {/*<div className="rank-item-content-problems-tag accepted">233</div>*/}
          {/*<div className="rank-item-content-problems-tag failed">-5</div>*/}
          {/*<div className="rank-item-content-problems-tag changed">-7</div>*/}
          {/*<div className="rank-item-content-problems-tag">E</div>*/}
          {/*<div className="rank-item-content-problems-tag">F</div>*/}
          {/*<div className="rank-item-content-problems-tag">G</div>*/}
        </div>
      </div>
      <div className="rank-item-solved">
        {get(accountInfo, 'solved')}
      </div>
      <div className="rank-item-times">
        {(get(accountInfo, 'time_used') / 60).toFixed(0)}
      </div>
    </div>;
  }
}

export default FancyRankItem;

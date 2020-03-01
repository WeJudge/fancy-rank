import React from 'react';
import FancyRank from './fancy_rank';
import bg from './images/beach-1852945_1920.jpg';
import './index.scss';

function App() {
  return (
    <div style={{ backgroundImage: `url(${bg})` }} className="fake_background">
      <FancyRank />
    </div>
  );
}

export default App;

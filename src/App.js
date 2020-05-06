import React from 'react';
import jQuery from 'jquery';
import FancyRank from './fancy_rank';
import './index.scss';
window.jQuery = jQuery;
require('jquery.scrollto');

function App() {
  return (
    <div className="fake_background">
      <FancyRank />
    </div>
  );
}

export default App;

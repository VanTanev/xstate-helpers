import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { assertEvent } from '../.';

const App = () => {
  return <div>{assertEvent.toString()}</div>;
};

ReactDOM.render(<App />, document.getElementById('root'));

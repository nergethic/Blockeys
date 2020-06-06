import * as React from 'react';
import * as test from './Block';

import PageInterface from '../file';

class App extends React.Component<PageInterface, {}> {
  render() {
    return (<div>
      <test.DragDrop></test.DragDrop>
      <h1>Welcome to React with Typescript</h1>
      <p>The color of this page is: {this.props.color}</p>
    </div>
    );
  }
}

export default App;
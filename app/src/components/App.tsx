import * as React from 'react';

import PageInterface from '../PageData';
import * as BlockGrid from './BlockGrid';

class App extends React.Component<PageInterface, {}> {
  //<p>props test: {this.props.color}</p>
  render() {
    return (<div>
      <BlockGrid.Container />
    </div>
    );
  }
}

export default App;
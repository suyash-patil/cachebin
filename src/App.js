import React from 'react';
import {Card} from 'baseui/card';
import { StatefulTabs, Tab } from "baseui/tabs-motion";
import {Plus, ArrowDown} from 'baseui/icon';
import {Block} from 'baseui/block';
import CreateBin from './components/CreateBin';
import GetBin from './components/GetBin';

function App() {
  return (
    <Block className='App'>
      <h1>Cachebin</h1>
      <h4>Cachebin is a safe and decentralized service to share code snippets, notes and many more. Paste anything and share with your friends</h4>  
      <Card>
        <StatefulTabs>
          <Tab title="Create" artwork={Plus}>
            <CreateBin />
          </Tab>
          <Tab title="Get" artwork={ArrowDown}>
            <GetBin />
          </Tab>
        </StatefulTabs>
      </Card>
    </Block>
  );
}

export default App;

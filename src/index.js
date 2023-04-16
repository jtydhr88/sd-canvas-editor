import React from 'react';
import ReactDOM from 'react-dom/client';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';

import { createStore } from 'polotno/model/store';

export const App = ({ store }) => {
  return (
    <PolotnoContainer style={{ width: '95vw', height: '100vh' }}>
      <SidePanelWrap>
        <SidePanel store={store} />
      </SidePanelWrap>
      <WorkspaceWrap>
        <Toolbar store={store} />
        <Workspace store={store} />
        <ZoomButtons store={store} />
      </WorkspaceWrap>
    </PolotnoContainer>
  );
};

let _store;

export const createPolotnoApp = ({ key, container }) => {
    const store = createStore({
        key: key,
        showCredit: true,
    });

    store.addPage();

    const root = ReactDOM.createRoot(container);

    root.render(<App store={store} />);

    _store = store;
};

export const getPolotnoStore = () => {
    return _store;
};

window.createPolotnoApp = createPolotnoApp;
window.getPolotnoStore = getPolotnoStore;
import Panel1Content from './Panel1Content.js';
import Panel2Content from './Panel2Content.js';
import './App.css';

declare global {
  interface Window {
    panelType?: string;
  }
}

function App() {
  const panelType = window.panelType;

  if (panelType === 'panel1') {
    return <Panel1Content />;
  } else if (panelType === 'panel2') {
    return <Panel2Content />;
  } else {
    return (
      <div>
        <h1>未知面板類型</h1>
        <p>請通過 VS Code 命令開啟正確的面板。</p>
      </div>
    );
  }
}

export default App;

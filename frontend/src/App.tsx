import React, { useState } from 'react';
import './App.css';
import { TransferForm } from './components/TransferForm';
import { UserList } from './components/UserList';
import { ActivityList } from './components/ActivityList';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTransferComplete = () => {
    // Increment trigger to force UserList and ActivityList to refresh
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>💰 Micropatrons</h1>
        <p>Transfer currency between users</p>
      </header>
      
      <main className="App-main">
        <div className="container">
          <div className="left-panel">
            <TransferForm onTransferComplete={handleTransferComplete} />
            <ActivityList refreshTrigger={refreshTrigger} />
          </div>
          
          <div className="right-panel">
            <UserList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
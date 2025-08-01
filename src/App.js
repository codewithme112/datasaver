import React, { useState } from 'react';
import CustomerLeadForm from './components/CustomerLeadForm';
import TodayEntries from './components/TodayEntries';

const App = () => {
  const [showTodayEntries, setShowTodayEntries] = useState(false);

  return (
    <>
      {showTodayEntries ? (
        <TodayEntries onBack={() => setShowTodayEntries(false)} />
      ) : (
        <CustomerLeadForm onShowEntries={() => setShowTodayEntries(true)} />
      )}
    </>
  );
};

export default App;

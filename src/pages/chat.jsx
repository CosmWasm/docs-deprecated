import React from 'react';
import Route from 'react-router';

function RedirectChat() {
  return (
    <Route path='/chat'>
      {() => {
        useEffect(() => {
          window.location.href = 'https://discord.gg/cPjEnPd';
        }, [])
        return null;
      }}
    </Route>
  );
}

export default RedirectChat;

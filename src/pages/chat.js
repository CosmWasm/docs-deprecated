import React from 'react';
import Layout from '@theme/Layout';

function RedirectChat() {
  return (
    <Layout title="Redirect">
      <head>
        <title>Redirecting to the CosmWasm community chat …</title>
        <meta http-equiv="refresh" content = "2;url=https://discord.gg/cPjEnPd" />
        <script>
          setTimeout(function() {
          window.location.href = "https://discord.gg/cPjEnPd"}, 2000);
        </script>
      </head>
      <body>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            fontSize: '20px',
          }}>
          <p>Redirecting to the CosmWasm community chat …</p>
          <p>If this doesn't work, <a href="https://discord.gg/cPjEnPd" title="CosmWasm Discord invite">click here</a>.</p>
        </div>
      </body>

    </Layout>
  );
}

export default RedirectChat;

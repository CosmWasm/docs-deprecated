import React from 'react';
import {BrowserRouter, Route} from 'react-router-dom';

function RedirectChat() {
  return (
    /*
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
        <div class="main-wrapper">
          <main class="container margin-vert--xl">
            <div class="row">
              <div class="col col--6 col--offset-3"><h1 class="hero__title">Redirecting to the CosmWasm community chat …</h1>
                <p>If this doesn't work, <a href="https://discord.gg/cPjEnPd" title="CosmWasm Discord invite">click here</a>.</p>
              </div>
            </div>
          </main>
        </div>
      </body>
    </Layout>
     */

  <BrowserRouter>
    <Route path='/chat' component={() => {
      window.location.href = 'https://discord.gg/cPjEnPd';
      return null;
    }}/>
  </BrowserRouter>
  );
}

export default RedirectChat;

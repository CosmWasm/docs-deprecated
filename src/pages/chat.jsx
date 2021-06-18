import React, {useEffect} from "react";
import Layout from '@theme/Layout';

function RedirectChat() {

  useEffect(() => {
    window.location.href = "https://discord.gg/cPjEnPd";
  }, []);

  return (
    <Layout title="Redirect">
      <div className="main-wrapper">
        <main className="container margin-vert--xl">
          <div className="row">
            <div className="col col--6 col--offset-3"><h1 className="hero__title">Redirecting to the CosmWasm community
              chat
              …</h1>
              <p>If this doesn't work, <a href="https://discord.gg/cPjEnPd" title="CosmWasm Discord invite">click
                here</a>.
              </p>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}

export default RedirectChat;

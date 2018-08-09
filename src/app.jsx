import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { JSO, Popup } from 'jso';

class ExampleApplication extends Component {

  constructor(props) {
    super(props)

    if ( process.env.VCAP_SERVICES && process.env.VCAP_APPLICATION) {
      let vcap_services = JSON.parse(process.env.VCAP_SERVICES) ;
      let vcap_application = JSON.parse(process.env.VCAP_APPLICATION) ;

      if ( ( vcap_services["p-identity"]) && ( vcap_services["p-identity"][0] ) && ( vcap_services["p-identity"][0].credentials ) ) {
        this.ssoServiceUrl = vcap_services["p-identity"][0].credentials.auth_domain;
        this.signon = new JSO({
          providerID: "pivotal",
          client_id: vcap_services["p-identity"][0].credentials.client_id ,
          redirect_uri: vcap_application && vcap_application.uris && ("https://" + vcap_application.uris[0] + "/implicit"),
          authorization: this.ssoServiceUrl + "/oauth/authorize",
          scopes: { request: ["openid"] }
        });
      } else {
        this.clientId = "client_id_placeholder";
      }
    }

    this.state = {
      isLoaded: false,
      token: ""
    }
  }

  getFragment(pattern) {
    var matcher = new RegExp(pattern + "=([^&]+)");
    var result = matcher.exec(window.location.hash);
    if (result) {
      return result[1];
    }
  }

  prettyToken(token) {
    return JSON.stringify(JSON.parse(atob(token.split('\.')[1])), null, '  ');
  }

  componentDidMount() {
    if (window.location.pathname === "/implicit") {
        this.signon.callback();
        this.signon.getToken()
          .then( (token) => {
            console.log("I got the token: " + token)
            this.setState({
              isLoaded: true,
              token: token.access_token
            });
          });
    }
  }

  render() {
    var page = null;
    if (window.location.pathname === "/") {
      if (this.clientId === "client_id_placeholder") {
        page = (
          <div>
            <h1>Warning: You need to bind to the SSO service.</h1>
            <div>Please bind your app to restore regular functionality</div>
          </div>
          )
      } else {
        var href="/implicit";
        page = (<div>
          <h1>Implicit sample</h1>
          <h2>What do you want to do?</h2>
          <ul>
            <li>
              <a href={href}>Log in via Implicit Grant Type</a>
            </li>
          </ul>
        </div>)
      }
    }

    if (window.location.pathname === "/implicit") {
      let { isLoaded, token } = this.state

      if ( isLoaded ) {
          var profileUrl = this.ssoServiceUrl + '/profile';
          const urlStr = window.location.protocol + '//' + window.location.host;
          var logoutUrl = this.ssoServiceUrl + '/logout.do' + '?redirect=' + urlStr + '&client_id=' + this.clientId;
          var productsUrl = "/products"

          page = (<div>
            <h1>Implicit sample</h1>
            <p>Your access token is:</p>
            <pre id="token">{token}</pre>

            <h2>What do you want to do?</h2>
            <ul>
              <li>
                <a id="profile" target="uaa" href={productsUrl}>Use the token to call a service</a>
              </li>
              <li>
                <a id="profile" target="uaa" href={profileUrl}>See your account profile on UAA (so you can de-authorize this client)</a>
              </li>
              <li>
                <a id="logout" href={logoutUrl}>Log out of UAA</a>
              </li>
            </ul>
          </div>);
          console.log("page set");
      } else {
        page = "<div>Logging in...</div>"
      }

    }

    if ( window.location.pathname == "/products") {
      var serviceUrl = "https://core-cf-webapi-comedic-eland.homelab.fynesy.com"
      page = ( <div>Product component here</div> ) ;
    }

    console.log("returning page")
    return page;
  }
}

ReactDOM.render(<ExampleApplication />, document.getElementById('root'));

module.hot.accept();

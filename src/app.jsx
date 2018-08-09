import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class ExampleApplication extends Component {

  constructor(props) {
    super(props)
    console.log(process.env.VCAP_SERVICES)
    console.log(process.env.VCAP_APPLICATION)
    if ( process.env.VCAP_SERVICES && process.env.VCAP_APPLICATION) {
      let vcap_services = JSON.parse(process.env.VCAP_SERVICES) ;
      let vcap_application = JSON.parse(process.env.VCAP_APPLICATION) ;

      if ( ( vcap_services["p-identity"]) && ( vcap_services["p-identity"][0] ) && ( vcap_services["p-identity"][0].credentials ) ) {
        this.ssoServiceUrl = vcap_services["p-identity"][0].credentials.auth_domain;
        this.clientId = vcap_services["p-identity"][0].credentials.client_id ;
        this.authDomain = vcap_services["p-identity"][0].credentials.auth_domain ;
        this.baseUrl = vcap_application && vcap_application.uris && ("https://" + vcap_application.uris[0] + "/") ;
      }
    } else {
      this.clientId = "client_id_placeholder"
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

  constructUaaRedirect() {
    return `${this.ssoServiceUrl}/oauth/authorize?client_id=${this.clientId}&response_type=token+id_token&redirect_uri=${this.baseUrl}implicit#uaaLocation=${this.ssoServiceUrl}`
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
        var href = this.constructUaaRedirect();
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
      var expiresIn = this.getFragment("expires_in");
      var scope = this.getFragment("scope");
      var jti = this.getFragment("jti");
      var idToken = this.prettyToken(this.getFragment("id_token"));
      var token = this.prettyToken(this.getFragment("access_token"));
      var tokenType = this.getFragment("token_type");
      var profileUrl = this.ssoServiceUrl + '/profile';
      const urlStr = window.location.protocol + '//' + window.location.host;
      var logoutUrl = this.ssoServiceUrl + '/logout.do' + '?redirect=' + urlStr + '&client_id=' + this.clientId;
      page = (<div>
        <h1>Implicit sample</h1>
        <p>The server only saw a request for /implicit. Everything after the # in the address bar is stuff that only your browser can see.</p>
        <p>Your ID Token token is:</p>
        <pre id="id_token">{idToken}</pre>
        <p>Expires in:</p>
        <pre id="expires_in">{expiresIn}</pre>
        <p>Scope:</p>
        <pre id="scope">{scope}</pre>
        <p>JTI:</p>
        <pre id="jti">{jti}</pre>

        <p>Your access token is:</p>
        <pre id="token">{token}</pre>
        <p>Your access token type:</p>
        <pre id="token_type">{tokenType}</pre>

        <h2>What do you want to do?</h2>
        <ul>
          <li>
            <a id="profile" target="uaa" href={profileUrl}>See your account profile on UAA (so you can de-authorize this client)</a>
          </li>
          <li>
            <a id="logout" href={logoutUrl}>Log out of UAA</a>
          </li>
        </ul>
      </div>);
    }
    return page;
  }
}

ReactDOM.render(<ExampleApplication />, document.getElementById('root'));

module.hot.accept();

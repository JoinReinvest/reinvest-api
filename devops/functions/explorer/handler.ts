import express, { Request } from 'express';
import serverless from 'serverless-http';

const hostedUI = process.env.ExplorerHostedUI;
const apiEndpoint = process.env.API_URL;

const page = (apiUrl: string, token: string, isAdmin: boolean) => `
<html lang="en">
  <head>
    <title>${isAdmin ? 'Admin ' : ''}GraphiQL Explorer</title>
    <style>
      body {
        height: 100%;
        margin: 0;
        width: 100%;
        overflow: hidden;
      }

      #graphiql {
        height: 100vh;
      }
    </style>

    <script
      src="https://unpkg.com/react@17/umd/react.development.js"
      integrity="sha512-Vf2xGDzpqUOEIKO+X2rgTLWPY+65++WPwCHkX2nFMu9IcstumPsf/uKKRd5prX3wOu8Q0GBylRpsDB26R6ExOg=="
      crossorigin="anonymous"
    ></script>
    <script
      src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"
      integrity="sha512-Wr9OKCTtq1anK0hq5bY3X/AvDI5EflDSAh0mE9gma+4hl+kXdTJPKZ3TwLMBcrgUeoY0s3dq9JjhCQc7vddtFg=="
      crossorigin="anonymous"
    ></script>
    <link rel="stylesheet" href="https://unpkg.com/graphiql/graphiql.min.css" />
  </head>

  <body>
    <div id="graphiql">Loading...</div>
    <script
      src="https://unpkg.com/graphiql/graphiql.min.js"
      type="application/javascript"
    ></script>
    <script>
      ReactDOM.render(
        React.createElement(GraphiQL, {
          fetcher: GraphiQL.createFetcher({
            url: "${apiUrl}",
            headers: {
                Authorization: "Bearer ${token}"
            } 
          }),
          defaultEditorToolsVisibility: true
        }),
        document.getElementById("graphiql")
      );
    </script>
        <a href="/explorer${
          isAdmin ? '/admin' : ''
        }" style="position: fixed;top:60px;right:47px;color:rgb(180, 0, 0);font-family:Roboto;font-size:18px;font-weight:500;">Relogin</a>
        ${
          isAdmin
            ? '<a href="/explorer" style="position: fixed;top:86px;right:31px;color:rgb(180, 0, 0);font-family:Roboto;font-size:18px;font-weight:500;">User Exp.</a>'
            : '<a href="/explorer/admin" style="position: fixed;top:86px;right:16px;color:rgb(180, 0, 0);font-family:Roboto;font-size:18px;font-weight:500;">Admin Exp.</a>'
        }
  </body>
</html>
`;

const handleToken = (adminHostedUI = '', adminPath = '') => `
<html>
    <script>
            const dictionary = {};
            const currentUrl = document.URL;
            const [url, hashedParameters] = currentUrl.split('#');
            if (hashedParameters) {
                const parameters = hashedParameters.split('&');
                for(let parameter of parameters) {
                    let [key, value] = parameter.split('=');
                    dictionary[key] = value;
                }
            }
            if (dictionary['access_token']) {
                window.location.href = '/explorer${adminPath}?access_token=' + dictionary['access_token'];
            } else {
                document.write('Missing Access token in the URL!<br/><a href="${hostedUI}${adminHostedUI}">Try to Login again</a>');
            }
    </script>
</html>
`;

const app = express();

app.get('/set-header', (req: Request, res: any) => {
  if (req.query.admin) {
    res.send(handleToken('?admin=1', '/admin'));

    return;
  }

  res.send(handleToken());
});

app.get('/explorer', (req: any, res: any) => {
  if (!req.query.access_token) {
    res.redirect(hostedUI);

    return;
  }

  res.send(page(apiEndpoint as string, req.query.access_token, false));
});
app.get('/explorer/admin', (req: any, res: any) => {
  if (!req.query.access_token) {
    res.redirect(hostedUI + '?admin=1');

    return;
  }

  res.send(page(apiEndpoint + '/admin', req.query.access_token, true));
});

export const main = serverless(app, {
  basePath: process.env.BASE_PATH,
});

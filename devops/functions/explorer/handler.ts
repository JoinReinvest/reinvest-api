import express, { Request } from 'express';
import serverless from 'serverless-http';

const hostedUI = process.env.ExplorerHostedUI;
const apiEndpoint = process.env.ApiUrl;

const page = `
<html lang="en">
  <head>
    <title>GraphiQL Explorer</title>
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
        <a href="/explorer" style="position: fixed;top:60px;right:46px;color:rgba(59, 75, 104, 0.76);font-family:Roboto;font-size:18px;font-weight:500;">Relogin</a>
    <div id="graphiql">Loading...</div>
    <script
      src="https://unpkg.com/graphiql/graphiql.min.js"
      type="application/javascript"
    ></script>
    <script>
      ReactDOM.render(
        React.createElement(GraphiQL, {
          fetcher: GraphiQL.createFetcher({
            url: '${apiEndpoint}',
            headers: {
                Authorization: "Bearer <put_your_jwt_here>"
            }
          }),
          defaultEditorToolsVisibility: true,
        }),
        document.getElementById('graphiql'),
      );
    </script>
  </body>
</html>
`;

const handleToken = `
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
                window.location.href = '/explorer?access_token=' + dictionary['access_token'];
            } else {
                document.write('Missing Access token in the URL!<br/><a href="${hostedUI}">Try to Login again</a>');
            }
    </script>
</html>
`;

const app = express();

app.get('/set-header', (req: Request, res: any) => {
  res.send(handleToken);
});

app.get('/explorer', (req: any, res: any) => {
  if (!req.query.access_token) {
    res.redirect(hostedUI);

    return;
  }

  const pageWithAuth = page.replace('<put_your_jwt_here>', req.query.access_token);
  res.send(pageWithAuth);
});

export const main = serverless(app);

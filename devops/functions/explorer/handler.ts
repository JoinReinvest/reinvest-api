import express from "express";
import serverless from "serverless-http";

const apiEndpoint = "http://localhost:3000/api";
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
          }),
          defaultHeaders: '{"Authorization": "Bearer <put_your_jwt_here>"}',
          defaultEditorToolsVisibility: true,
        }),
        document.getElementById('graphiql'),
      );
    </script>
  </body>
</html>
`;

const app = express();

app.get("/explorer", (req: any, res: any) => {
  res.send(page);
});

export const main = serverless(app);

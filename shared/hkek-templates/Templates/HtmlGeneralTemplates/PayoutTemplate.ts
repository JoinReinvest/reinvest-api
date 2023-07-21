import { HtmlTemplate } from 'Templates/Types';

export const PayoutHTMLTemplate: HtmlTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
  </head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

    body {
      font-family: 'Roboto', sans-serif;
    }
    div {
        margin-bottom: 50px
    }
  </style>
  <body>
    {{#each items}}

      {{#if (isdefined tableContent)}}
          <table>
            <thead>
                <tr>
                    <th>Account Id</th>
                    <th>Amount</th>
                    <th>North Capital Account Number</th>
                </tr>
            </thead>
            <tbody>
                {{#each tableContent}}
                  <tr>
                    <td>
                      {{accountId}}
                    </td>
                    <td>
                      {{amount}}
                    </td>
                    <td>
                      {{northCapitalAccountNumber}}
                    </td>
                  </tr>
                {{/each}}
            </tbody>
          </table>
        {{/if}}

    {{/each}}

  </body>
</html>
`;

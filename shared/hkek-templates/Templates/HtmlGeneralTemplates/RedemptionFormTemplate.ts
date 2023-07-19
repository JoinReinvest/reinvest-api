import { HtmlTemplate } from 'Templates/Types';

export const RedemptionFormHTMLTemplate: HtmlTemplate = `
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

          {{#each paragraphs}}
              {{#each lines}}
                  <p>{{bold_text this}}</p>
              {{/each}}
          {{/each}}
          <table>
            <thead>
                <tr>
                    <th>Security Name</th>
                    <th>Unit Price</th>
                    <th>Securityholder Name</th>
                    <th>Securityholder Email</th>
                    <th>Current Distribution Units</th>
                    <th>New Distribution Units</th>
                    <th>Date of Redemption</th>
                </tr>
            </thead>
            <tbody>
                {{#each tableContent}}
                  <tr>
                    <td>
                      {{securityName}}
                    </td>
                    <td>
                      {{unitPrice}}
                    </td>
                    <td>
                      {{securityholderName}}
                    </td>
                    <td>
                      {{securityholderEmail}}
                    </td>
                    <td>
                      {{currentDistributionUnits}}
                    </td>
                    <td>
                      {{newDistributionUnits}}
                    </td>
                    <td>
                      {{dateOfRedemption}}
                    </td>
                  </tr>
                {{/each}}
            </tbody>
          </table>
          {{else}}
          {{#each paragraphs}}
              {{#each lines}}
                  <p>{{bold_text this}}</p>
              {{/each}}
          {{/each}}
        {{/if}}

    {{/each}}

  </body>
</html>
`;

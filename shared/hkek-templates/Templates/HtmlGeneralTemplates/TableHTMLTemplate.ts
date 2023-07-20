import { HtmlTemplate } from 'Templates/Types';

export const TableHTMLTemplate: HtmlTemplate = `
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
          <table style="border: 1px solid black;border-collapse: collapse; width: 100%;">
            {{#if (isdefined tableContent.header)}}
            <thead>
                <tr  style="border: 1px solid black;">
                {{#each tableContent.header}}
                    <th  style="border: 1px solid black;">{{this}}</th>
                {{/each}}
                </tr>
            </thead>
            {{/if}}
            <tbody>
                {{#each tableContent.data}}
                  <tr style="border: 1px solid black;">
                  {{#each this}}
                    <td  style="border: 1px solid black;">
                      {{this}}
                    </td>
                  {{/each}}
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

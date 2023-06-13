const agreementHTMLTemplate: string = `
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
        <div>
            {{#if header}}
                <h2>{{header}}</h2>
            {{/if}}

            {{#each paragraphs}}
                {{#each lines}}
                    <p>{{bold_text this}}</p>
                {{/each}}

                {{#if (isdefined isCheckedOption)}}
                    {{#if isCheckedOption}}
                    <input type="checkbox" checked/>
                    {{else}}
                    <input type="checkbox"/>
                    {{/if}}
                {{/if}}
            {{/each}}
        </div>
    {{/each}}
  </body>
</html>
`;

export default agreementHTMLTemplate;

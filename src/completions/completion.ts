import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  Position,
  Range,
  TextEdit,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { EdgeParser } from "../server/parser";

export class EdgeCompletionProvider {
  private edgeParser: EdgeParser;

  constructor(edgeParser: EdgeParser) {
    this.edgeParser = edgeParser;
  }

  private edgeDirectives: CompletionItem[] = [
    // Conditional directives - OPTIMIZED FOR ZED EDITOR
    {
      label: "@if",
      kind: CompletionItemKind.Keyword,
      detail: "Conditional directive",
      insertText: "@if(${1:condition})\n$0\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "@if",
      documentation:
        "Creates a conditional block that renders content based on a condition.",
    },
    {
      label: "@elseif",
      kind: CompletionItemKind.Keyword,
      detail: "Else-if directive",
      insertText: "@elseif(${1:condition})\n$0",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "@elseif",
      documentation: "Adds an else-if condition to an if block.",
    },
    {
      label: "@else",
      kind: CompletionItemKind.Keyword,
      detail: "Else directive",
      insertText: "@else\n$0",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "@else",
      documentation: "Adds an else clause to an if block.",
    },
    {
      label: "@unless",
      kind: CompletionItemKind.Keyword,
      detail: "Unless directive",
      insertText: "@unless(${1:condition})\n$0\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "@unless",
      documentation:
        "Creates a conditional block that renders content unless a condition is true.",
    },

    // Loop directives
    {
      label: "@each",
      kind: CompletionItemKind.Keyword,
      detail: "Loop directive",
      insertText: "@each(${1:item} in ${2:items})\n$0\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "@each",
      documentation:
        "Loops over iterable data and renders content for each item.",
    },
    {
      label: "@each (with index)",
      kind: CompletionItemKind.Keyword,
      detail: "Loop with index directive",
      insertText: "@each((${1:item}, ${2:index}) in ${3:items})\n$0\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "each",
      documentation:
        "Loops over iterable data with index and renders content for each item.",
    },

    // Component and template directives
    {
      label: "@component",
      kind: CompletionItemKind.Function,
      detail: "Include component",
      insertText: "@component('${1:name}')\n$0\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "@component",
      documentation: "Include a reusable component.",
    },
    {
      label: "@!component",
      kind: CompletionItemKind.Function,
      detail: "Inline component rendering",
      insertText: "@!component('${1:name}')",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "!component",
      documentation: "Include a component inline without a block.",
    },
    {
      label: "@!component (with props)",
      kind: CompletionItemKind.Function,
      detail: "Inline component with props",
      insertText: "@!component('${1:name}', { ${2:prop}: ${3:value} })",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "!component",
      documentation: "Include a component inline with props.",
    },
    {
      label: "@slot",
      kind: CompletionItemKind.Function,
      detail: "Define named slot",
      insertText: "@slot('${1:name}')\n$0\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "slot",
      documentation: "Define a named slot in a component.",
    },
    {
      label: "@slot (main)",
      kind: CompletionItemKind.Function,
      detail: "Define main slot",
      insertText: "@slot\n$0\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "slot",
      documentation: "Define the main slot in a component.",
    },
    {
      label: "@!slot",
      kind: CompletionItemKind.Function,
      detail: "Auto-closed slot",
      insertText: "@!slot('${1:name}', '${2:default_content}')",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "!slot",
      documentation: "Define a named slot with default content.",
    },
    {
      label: "@inject",
      kind: CompletionItemKind.Variable,
      detail: "Inject variable",
      insertText: "@inject(${1:variable})",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "inject",
      documentation: "Inject a variable into the template context.",
    },
    {
      label: "@include",
      kind: CompletionItemKind.Function,
      detail: "Include template",
      insertText: "@include('${1:template}')",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "include",
      documentation: "Include another template file.",
    },
    {
      label: "@includeIf",
      kind: CompletionItemKind.Function,
      detail: "Conditional include",
      insertText: "@includeIf(${1:condition}, '${2:template}')",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "includeIf",
      documentation: "Include a template file only if a condition is true.",
    },

    // Utility directives
    {
      label: "@eval",
      kind: CompletionItemKind.Function,
      detail: "Evaluate expression",
      insertText: "@eval(${1:expression})",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "eval",
      documentation: "Evaluate a JavaScript expression.",
    },
    {
      label: "@let",
      kind: CompletionItemKind.Variable,
      detail: "Declare variable",
      insertText: "@let(${1:name} = ${2:value})",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "let",
      documentation: "Declare a template variable.",
    },
    {
      label: "@assign",
      kind: CompletionItemKind.Variable,
      detail: "Assign value",
      insertText: "@assign(${1:name} = ${2:value})",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "assign",
      documentation: "Assign a value to a variable.",
    },
    {
      label: "@debugger",
      kind: CompletionItemKind.Keyword,
      detail: "Debug breakpoint",
      insertText: "@debugger",
      filterText: "debugger",
      documentation: "Set a debug breakpoint.",
    },
    {
      label: "@newError",
      kind: CompletionItemKind.Function,
      detail: "Create new error",
      insertText:
        "@newError(${1:message}, ${2:filename}, ${3:line}, ${4:column})",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "newError",
      documentation:
        "Create a new error with message, filename, line, and column.",
    },

    // AdonisJS specific directives
    {
      label: "@vite",
      kind: CompletionItemKind.Function,
      detail: "Vite asset",
      insertText: "@vite('${1:path}')",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "vite",
      documentation: "Handle Vite assets.",
    },
    {
      label: "@viteReactRefresh",
      kind: CompletionItemKind.Function,
      detail: "Vite React refresh",
      insertText: "@viteReactRefresh",
      filterText: "viteReactRefresh",
      documentation: "Enable React HMR in development.",
    },
    {
      label: "@svg",
      kind: CompletionItemKind.Function,
      detail: "Include SVG",
      insertText: "@svg('${1:path}')",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "svg",
      documentation: "Include an SVG file.",
    },
    {
      label: "@flashMessage",
      kind: CompletionItemKind.Function,
      detail: "Flash message helper",
      insertText: "@flashMessage('${1:key}')\n$0\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "flashMessage",
      documentation: "Read flash messages conditionally.",
    },
    {
      label: "@error",
      kind: CompletionItemKind.Function,
      detail: "Error helper",
      insertText: "@error('${1:field}')\n$0\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "error",
      documentation: "Read error messages from errorsBag.",
    },
    {
      label: "@inputError",
      kind: CompletionItemKind.Function,
      detail: "Input error helper",
      insertText: "@inputError('${1:field}')\n$0\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "inputError",
      documentation: "Read validation error messages from inputErrorsBag.",
    },
    {
      label: "@can",
      kind: CompletionItemKind.Function,
      detail: "Authorization check",
      insertText: "@can('${1:permission}')\n$0\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "can",
      documentation: "Authorization check in templates.",
    },
    {
      label: "@cannot",
      kind: CompletionItemKind.Function,
      detail: "Authorization negation",
      insertText: "@cannot('${1:permission}')\n$0\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "cannot",
      documentation: "Negated authorization check in templates.",
    },

    // Auto-closing pairs for mustache syntax
    {
      label: "{{-- Comment --}}",
      kind: CompletionItemKind.Snippet,
      detail: "EdgeJS Comment",
      insertText: "{{-- ${1:comment} --}}",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "comment",
      documentation: "Insert an EdgeJS comment block.",
    },
    {
      label: "{{{ Raw Output }}}",
      kind: CompletionItemKind.Snippet,
      detail: "EdgeJS Raw Output (unescaped)",
      insertText: "{{{ ${1:expression} }}}",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "raw",
      documentation: "Output raw, unescaped HTML content.",
    },
    {
      label: "{{ Escaped Output }}",
      kind: CompletionItemKind.Snippet,
      detail: "EdgeJS Escaped Output",
      insertText: "{{ ${1:expression} }}",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "output",
      documentation: "Output escaped content (safe for HTML).",
    },
  ];

  // NEW: HTML Tags with snippets
  private htmlTags: CompletionItem[] = [
    // Structure tags
    {
      label: "div",
      kind: CompletionItemKind.Keyword,
      detail: "Division element",
      insertText: '<div${1: class="${2:}"}>${3}</div>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Generic container for flow content",
    },
    {
      label: "span",
      kind: CompletionItemKind.Keyword,
      detail: "Inline container",
      insertText: '<span${1: class="${2:}"}>${3}</span>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Generic inline container for phrasing content",
    },
    {
      label: "section",
      kind: CompletionItemKind.Keyword,
      detail: "Section element",
      insertText: '<section${1: class="${2:}"}>${3}</section>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Standalone section of content",
    },
    {
      label: "article",
      kind: CompletionItemKind.Keyword,
      detail: "Article element",
      insertText: '<article${1: class="${2:}"}>${3}</article>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Self-contained composition in a document",
    },
    {
      label: "header",
      kind: CompletionItemKind.Keyword,
      detail: "Header element",
      insertText: '<header${1: class="${2:}"}>${3}</header>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Introductory content for its nearest sectioning content",
    },
    {
      label: "footer",
      kind: CompletionItemKind.Keyword,
      detail: "Footer element",
      insertText: '<footer${1: class="${2:}"}>${3}</footer>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Footer for its nearest sectioning content",
    },
    {
      label: "main",
      kind: CompletionItemKind.Keyword,
      detail: "Main content element",
      insertText: '<main${1: class="${2:}"}>${3}</main>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Dominant content of the document body",
    },
    {
      label: "nav",
      kind: CompletionItemKind.Keyword,
      detail: "Navigation element",
      insertText: '<nav${1: class="${2:}"}>${3}</nav>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Section with navigation links",
    },
    {
      label: "aside",
      kind: CompletionItemKind.Keyword,
      detail: "Aside element",
      insertText: '<aside${1: class="${2:}"}>${3}</aside>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Content aside from the main content",
    },

    // Heading tags
    {
      label: "h1",
      kind: CompletionItemKind.Keyword,
      detail: "Level 1 heading",
      insertText: '<h1${1: class="${2:}"}>${3}</h1>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Most important heading",
    },
    {
      label: "h2",
      kind: CompletionItemKind.Keyword,
      detail: "Level 2 heading",
      insertText: '<h2${1: class="${2:}"}>${3}</h2>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Second-level heading",
    },
    {
      label: "h3",
      kind: CompletionItemKind.Keyword,
      detail: "Level 3 heading",
      insertText: '<h3${1: class="${2:}"}>${3}</h3>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Third-level heading",
    },
    {
      label: "h4",
      kind: CompletionItemKind.Keyword,
      detail: "Level 4 heading",
      insertText: '<h4${1: class="${2:}"}>${3}</h4>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Fourth-level heading",
    },
    {
      label: "h5",
      kind: CompletionItemKind.Keyword,
      detail: "Level 5 heading",
      insertText: '<h5${1: class="${2:}"}>${3}</h5>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Fifth-level heading",
    },
    {
      label: "h6",
      kind: CompletionItemKind.Keyword,
      detail: "Level 6 heading",
      insertText: '<h6${1: class="${2:}"}>${3}</h6>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Sixth-level heading",
    },

    // Text content tags
    {
      label: "p",
      kind: CompletionItemKind.Keyword,
      detail: "Paragraph element",
      insertText: '<p${1: class="${2:}"}>${3}</p>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Paragraph of text",
    },
    {
      label: "a",
      kind: CompletionItemKind.Keyword,
      detail: "Anchor/Link element",
      insertText: '<a href="${1:#}"${2: class="${3:}"}>${4}</a>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Hyperlink to web pages, files, email addresses, locations",
    },
    {
      label: "strong",
      kind: CompletionItemKind.Keyword,
      detail: "Strong importance element",
      insertText: "<strong>${1}</strong>",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Strong importance, seriousness, or urgency",
    },
    {
      label: "em",
      kind: CompletionItemKind.Keyword,
      detail: "Emphasis element",
      insertText: "<em>${1}</em>",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Stress emphasis",
    },
    {
      label: "small",
      kind: CompletionItemKind.Keyword,
      detail: "Side comment element",
      insertText: "<small>${1}</small>",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Side comments and small print",
    },
    {
      label: "code",
      kind: CompletionItemKind.Keyword,
      detail: "Inline code element",
      insertText: "<code>${1}</code>",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Fragment of computer code",
    },
    {
      label: "pre",
      kind: CompletionItemKind.Keyword,
      detail: "Preformatted text element",
      insertText: '<pre${1: class="${2:}"}>${3}</pre>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Preformatted text",
    },

    // List tags
    {
      label: "ul",
      kind: CompletionItemKind.Keyword,
      detail: "Unordered list",
      insertText: '<ul${1: class="${2:}"}>\n  <li>${3}</li>\n</ul>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Unordered list of items",
    },
    {
      label: "ol",
      kind: CompletionItemKind.Keyword,
      detail: "Ordered list",
      insertText: '<ol${1: class="${2:}"}>\n  <li>${3}</li>\n</ol>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Ordered list of items",
    },
    {
      label: "li",
      kind: CompletionItemKind.Keyword,
      detail: "List item",
      insertText: '<li${1: class="${2:}"}>${3}</li>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "List item",
    },
    {
      label: "dl",
      kind: CompletionItemKind.Keyword,
      detail: "Description list",
      insertText:
        '<dl${1: class="${2:}"}>\n  <dt>${3}</dt>\n  <dd>${4}</dd>\n</dl>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Description list",
    },
    {
      label: "dt",
      kind: CompletionItemKind.Keyword,
      detail: "Description term",
      insertText: "<dt>${1}</dt>",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Term in a description list",
    },
    {
      label: "dd",
      kind: CompletionItemKind.Keyword,
      detail: "Description definition",
      insertText: "<dd>${1}</dd>",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Description of a term in a description list",
    },

    // Form elements
    {
      label: "form",
      kind: CompletionItemKind.Keyword,
      detail: "Form element",
      insertText:
        '<form action="${1}" method="${2:post}"${3: class="${4:}"}>\n  ${5}\n</form>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Interactive form with controls",
    },
    {
      label: "input",
      kind: CompletionItemKind.Keyword,
      detail: "Input element",
      insertText:
        '<input type="${1:text}" name="${2}" id="${3}"${4: class="${5:}"}${6: placeholder="${7:}"} />',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Input control",
    },
    {
      label: "textarea",
      kind: CompletionItemKind.Keyword,
      detail: "Text area element",
      insertText:
        '<textarea name="${1}" id="${2}"${3: class="${4:}"}${5: placeholder="${6:}"}>${7}</textarea>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Multi-line text input control",
    },
    {
      label: "button",
      kind: CompletionItemKind.Keyword,
      detail: "Button element",
      insertText: '<button type="${1:button}"${2: class="${3:}"}>${4}</button>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Clickable button",
    },
    {
      label: "select",
      kind: CompletionItemKind.Keyword,
      detail: "Select element",
      insertText:
        '<select name="${1}" id="${2}"${3: class="${4:}"}>\n  <option value="${5}">${6}</option>\n</select>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Control for selecting among options",
    },
    {
      label: "option",
      kind: CompletionItemKind.Keyword,
      detail: "Option element",
      insertText: '<option value="${1}">${2}</option>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Option in a select element",
    },
    {
      label: "optgroup",
      kind: CompletionItemKind.Keyword,
      detail: "Option group element",
      insertText:
        '<optgroup label="${1}">\n  <option value="${2}">${3}</option>\n</optgroup>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Group of option elements",
    },
    {
      label: "label",
      kind: CompletionItemKind.Keyword,
      detail: "Label element",
      insertText: '<label for="${1}"${2: class="${3:}"}>${4}</label>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Caption for a form control",
    },
    {
      label: "fieldset",
      kind: CompletionItemKind.Keyword,
      detail: "Fieldset element",
      insertText:
        '<fieldset${1: class="${2:}"}>\n  <legend>${3}</legend>\n  ${4}\n</fieldset>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Group of related form controls",
    },
    {
      label: "legend",
      kind: CompletionItemKind.Keyword,
      detail: "Legend element",
      insertText: "<legend>${1}</legend>",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Caption for a fieldset element",
    },

    // Media elements
    {
      label: "img",
      kind: CompletionItemKind.Keyword,
      detail: "Image element",
      insertText: '<img src="${1}" alt="${2}"${3: class="${4:}"} />',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Embeds an image",
    },
    {
      label: "video",
      kind: CompletionItemKind.Keyword,
      detail: "Video element",
      insertText:
        '<video${1: controls}${2: class="${3:}"}>\n  <source src="${4}" type="video/${5:mp4}">\n  ${6:Your browser does not support the video tag.}\n</video>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Embeds video content",
    },
    {
      label: "audio",
      kind: CompletionItemKind.Keyword,
      detail: "Audio element",
      insertText:
        '<audio${1: controls}${2: class="${3:}"}>\n  <source src="${4}" type="audio/${5:mp3}">\n  ${6:Your browser does not support the audio tag.}\n</audio>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Embeds audio content",
    },
    {
      label: "source",
      kind: CompletionItemKind.Keyword,
      detail: "Source element",
      insertText: '<source src="${1}" type="${2}" />',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Media resource for video or audio elements",
    },

    // Table elements
    {
      label: "table",
      kind: CompletionItemKind.Keyword,
      detail: "Table element",
      insertText:
        '<table${1: class="${2:}"}>\n  <thead>\n    <tr>\n      <th>${3}</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>${4}</td>\n    </tr>\n  </tbody>\n</table>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Tabular data",
    },
    {
      label: "thead",
      kind: CompletionItemKind.Keyword,
      detail: "Table head element",
      insertText: "<thead>\n  <tr>\n    <th>${1}</th>\n  </tr>\n</thead>",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Header content for a table",
    },
    {
      label: "tbody",
      kind: CompletionItemKind.Keyword,
      detail: "Table body element",
      insertText: "<tbody>\n  <tr>\n    <td>${1}</td>\n  </tr>\n</tbody>",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Body content for a table",
    },
    {
      label: "tfoot",
      kind: CompletionItemKind.Keyword,
      detail: "Table foot element",
      insertText: "<tfoot>\n  <tr>\n    <td>${1}</td>\n  </tr>\n</tfoot>",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Footer content for a table",
    },
    {
      label: "tr",
      kind: CompletionItemKind.Keyword,
      detail: "Table row element",
      insertText: '<tr${1: class="${2:}"}>\n  <td>${3}</td>\n</tr>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Table row",
    },
    {
      label: "td",
      kind: CompletionItemKind.Keyword,
      detail: "Table data cell",
      insertText: '<td${1: class="${2:}"}>${3}</td>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Table data cell",
    },
    {
      label: "th",
      kind: CompletionItemKind.Keyword,
      detail: "Table header cell",
      insertText: '<th${1: class="${2:}"}>${3}</th>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Table header cell",
    },
    {
      label: "caption",
      kind: CompletionItemKind.Keyword,
      detail: "Table caption element",
      insertText: "<caption>${1}</caption>",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Caption for a table",
    },
    {
      label: "colgroup",
      kind: CompletionItemKind.Keyword,
      detail: "Column group element",
      insertText: '<colgroup>\n  <col span="${1:1}">\n</colgroup>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Group of columns in a table",
    },
    {
      label: "col",
      kind: CompletionItemKind.Keyword,
      detail: "Column element",
      insertText: '<col span="${1:1}" />',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Column within a table",
    },

    // Interactive elements
    {
      label: "details",
      kind: CompletionItemKind.Keyword,
      detail: "Details disclosure element",
      insertText:
        '<details${1: class="${2:}"}>\n  <summary>${3}</summary>\n  ${4}\n</details>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Disclosure widget for additional information",
    },
    {
      label: "summary",
      kind: CompletionItemKind.Keyword,
      detail: "Summary element",
      insertText: "<summary>${1}</summary>",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Summary for a details element",
    },
    {
      label: "dialog",
      kind: CompletionItemKind.Keyword,
      detail: "Dialog element",
      insertText: '<dialog${1: class="${2:}"}>\n  ${3}\n</dialog>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Dialog box or modal",
    },

    // Semantic elements
    {
      label: "time",
      kind: CompletionItemKind.Keyword,
      detail: "Time element",
      insertText: '<time datetime="${1}">${2}</time>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Machine-readable date/time",
    },
    {
      label: "mark",
      kind: CompletionItemKind.Keyword,
      detail: "Mark element",
      insertText: "<mark>${1}</mark>",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Highlighted text",
    },
    {
      label: "blockquote",
      kind: CompletionItemKind.Keyword,
      detail: "Block quotation element",
      insertText:
        '<blockquote${1: cite="${2:}"}${3: class="${4:}"}>\n  ${5}\n</blockquote>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Extended quotation",
    },
    {
      label: "q",
      kind: CompletionItemKind.Keyword,
      detail: "Inline quotation element",
      insertText: '<q${1: cite="${2:}"}>${3}</q>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Inline quotation",
    },
    {
      label: "cite",
      kind: CompletionItemKind.Keyword,
      detail: "Citation element",
      insertText: "<cite>${1}</cite>",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Citation of a creative work",
    },
    {
      label: "abbr",
      kind: CompletionItemKind.Keyword,
      detail: "Abbreviation element",
      insertText: '<abbr title="${1}">${2}</abbr>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Abbreviation or acronym",
    },
    {
      label: "address",
      kind: CompletionItemKind.Keyword,
      detail: "Contact information element",
      insertText: '<address${1: class="${2:}"}>\n  ${3}\n</address>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Contact information",
    },

    // Meta elements (for head section)
    {
      label: "meta",
      kind: CompletionItemKind.Keyword,
      detail: "Metadata element",
      insertText: '<meta ${1:name="${2}"} content="${3}" />',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Metadata about the document",
    },
    {
      label: "link",
      kind: CompletionItemKind.Keyword,
      detail: "External resource link element",
      insertText: '<link rel="${1:stylesheet}" href="${2}" />',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Link to external resource",
    },
    {
      label: "script",
      kind: CompletionItemKind.Keyword,
      detail: "Script element",
      insertText:
        '<script${1: src="${2:}"}${3: type="text/javascript"}>\n  ${4}\n</script>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Executable script",
    },
    {
      label: "style",
      kind: CompletionItemKind.Keyword,
      detail: "Style element",
      insertText: '<style${1: type="text/css"}>\n  ${2}\n</style>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Style information",
    },

    // Container elements
    {
      label: "figure",
      kind: CompletionItemKind.Keyword,
      detail: "Figure element",
      insertText:
        '<figure${1: class="${2:}"}>\n  ${3}\n  <figcaption>${4}</figcaption>\n</figure>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Self-contained content with optional caption",
    },
    {
      label: "figcaption",
      kind: CompletionItemKind.Keyword,
      detail: "Figure caption element",
      insertText: "<figcaption>${1}</figcaption>",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Caption for a figure element",
    },

    // Line break and dividers
    {
      label: "br",
      kind: CompletionItemKind.Keyword,
      detail: "Line break element",
      insertText: "<br />",
      documentation: "Line break",
    },
    {
      label: "hr",
      kind: CompletionItemKind.Keyword,
      detail: "Horizontal rule element",
      insertText: '<hr${1: class="${2:}"} />',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Thematic break or horizontal rule",
    },

    // Less common but useful elements
    {
      label: "canvas",
      kind: CompletionItemKind.Keyword,
      detail: "Canvas element",
      insertText:
        '<canvas${1: width="${2:300}"} ${3: height="${4:150}"}${5: class="${6:}"}>\n  ${7:Your browser does not support the canvas tag.}\n</canvas>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Graphics canvas",
    },
    {
      label: "svg",
      kind: CompletionItemKind.Keyword,
      detail: "SVG element",
      insertText:
        '<svg${1: width="${2:100}"} ${3: height="${4:100}"}${5: class="${6:}"}>\n  ${7}\n</svg>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Scalable Vector Graphics",
    },
    {
      label: "iframe",
      kind: CompletionItemKind.Keyword,
      detail: "Inline frame element",
      insertText:
        '<iframe src="${1}"${2: width="${3:300}"} ${4: height="${5:200}"}${6: class="${7:}"}></iframe>',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Inline frame for embedding content",
    },
  ];

  // NEW: HTML Attributes for context-aware completion
  private htmlAttributes: CompletionItem[] = [
    // Global attributes
    {
      label: "class",
      kind: CompletionItemKind.Property,
      detail: "CSS classes",
      insertText: 'class="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Space-separated list of CSS classes",
    },
    {
      label: "id",
      kind: CompletionItemKind.Property,
      detail: "Element identifier",
      insertText: 'id="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Unique identifier for the element",
    },
    {
      label: "style",
      kind: CompletionItemKind.Property,
      detail: "Inline CSS styles",
      insertText: 'style="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Inline CSS styling declarations",
    },
    {
      label: "title",
      kind: CompletionItemKind.Property,
      detail: "Advisory information",
      insertText: 'title="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Advisory information about the element",
    },
    {
      label: "lang",
      kind: CompletionItemKind.Property,
      detail: "Language",
      insertText: 'lang="${1:en}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Language of the element content",
    },
    {
      label: "dir",
      kind: CompletionItemKind.Property,
      detail: "Text direction",
      insertText: 'dir="${1:ltr}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Text direction (ltr, rtl, auto)",
    },
    {
      label: "hidden",
      kind: CompletionItemKind.Property,
      detail: "Hidden element",
      insertText: "hidden",
      documentation: "Indicates that the element is not relevant",
    },
    {
      label: "tabindex",
      kind: CompletionItemKind.Property,
      detail: "Tab order",
      insertText: 'tabindex="${1:0}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Tab navigation order",
    },
    {
      label: "contenteditable",
      kind: CompletionItemKind.Property,
      detail: "Editable content",
      insertText: 'contenteditable="${1:true}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Whether the element content is editable",
    },
    {
      label: "spellcheck",
      kind: CompletionItemKind.Property,
      detail: "Spell checking",
      insertText: 'spellcheck="${1:true}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Whether spell checking is enabled",
    },

    // Data attributes
    {
      label: "data-*",
      kind: CompletionItemKind.Property,
      detail: "Custom data attribute",
      insertText: 'data-${1:name}="${2}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Custom data attribute",
    },

    // ARIA attributes
    {
      label: "aria-label",
      kind: CompletionItemKind.Property,
      detail: "Accessibility label",
      insertText: 'aria-label="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Accessible name for the element",
    },
    {
      label: "aria-labelledby",
      kind: CompletionItemKind.Property,
      detail: "Labelled by element ID",
      insertText: 'aria-labelledby="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "References elements that label the current element",
    },
    {
      label: "aria-describedby",
      kind: CompletionItemKind.Property,
      detail: "Described by element ID",
      insertText: 'aria-describedby="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "References elements that describe the current element",
    },
    {
      label: "aria-hidden",
      kind: CompletionItemKind.Property,
      detail: "Hidden from screen readers",
      insertText: 'aria-hidden="${1:true}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Hidden from assistive technologies",
    },
    {
      label: "aria-expanded",
      kind: CompletionItemKind.Property,
      detail: "Expanded state",
      insertText: 'aria-expanded="${1:false}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Whether a collapsible element is expanded",
    },
    {
      label: "aria-selected",
      kind: CompletionItemKind.Property,
      detail: "Selected state",
      insertText: 'aria-selected="${1:false}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Whether an element is selected",
    },
    {
      label: "aria-checked",
      kind: CompletionItemKind.Property,
      detail: "Checked state",
      insertText: 'aria-checked="${1:false}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Whether an element is checked",
    },
    {
      label: "aria-disabled",
      kind: CompletionItemKind.Property,
      detail: "Disabled state",
      insertText: 'aria-disabled="${1:false}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Whether an element is disabled",
    },
    {
      label: "role",
      kind: CompletionItemKind.Property,
      detail: "ARIA role",
      insertText: 'role="${1:button}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "ARIA role of the element",
    },

    // Form attributes
    {
      label: "type",
      kind: CompletionItemKind.Property,
      detail: "Input type",
      insertText: 'type="${1:text}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Type of input control",
    },
    {
      label: "name",
      kind: CompletionItemKind.Property,
      detail: "Form control name",
      insertText: 'name="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Name of the form control",
    },
    {
      label: "value",
      kind: CompletionItemKind.Property,
      detail: "Element value",
      insertText: 'value="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Value of the element",
    },
    {
      label: "placeholder",
      kind: CompletionItemKind.Property,
      detail: "Placeholder text",
      insertText: 'placeholder="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Hint text for input fields",
    },
    {
      label: "required",
      kind: CompletionItemKind.Property,
      detail: "Required field",
      insertText: "required",
      documentation: "Specifies that the input field must be filled out",
    },
    {
      label: "disabled",
      kind: CompletionItemKind.Property,
      detail: "Disabled control",
      insertText: "disabled",
      documentation: "Specifies that the input should be disabled",
    },
    {
      label: "readonly",
      kind: CompletionItemKind.Property,
      detail: "Read-only control",
      insertText: "readonly",
      documentation: "Specifies that the input should be read-only",
    },
    {
      label: "checked",
      kind: CompletionItemKind.Property,
      detail: "Checked state",
      insertText: "checked",
      documentation: "Specifies that the input should be pre-selected",
    },
    {
      label: "selected",
      kind: CompletionItemKind.Property,
      detail: "Selected option",
      insertText: "selected",
      documentation: "Specifies that an option should be pre-selected",
    },
    {
      label: "multiple",
      kind: CompletionItemKind.Property,
      detail: "Multiple selection",
      insertText: "multiple",
      documentation: "Allows multiple values to be selected",
    },
    {
      label: "autocomplete",
      kind: CompletionItemKind.Property,
      detail: "Autocomplete behavior",
      insertText: 'autocomplete="${1:off}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Whether the form control should have autocomplete enabled",
    },
    {
      label: "autofocus",
      kind: CompletionItemKind.Property,
      detail: "Auto focus",
      insertText: "autofocus",
      documentation:
        "Specifies that the element should automatically get focus",
    },
    {
      label: "form",
      kind: CompletionItemKind.Property,
      detail: "Associated form",
      insertText: 'form="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Associates the element with a form",
    },
    {
      label: "min",
      kind: CompletionItemKind.Property,
      detail: "Minimum value",
      insertText: 'min="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Minimum value for the input",
    },
    {
      label: "max",
      kind: CompletionItemKind.Property,
      detail: "Maximum value",
      insertText: 'max="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Maximum value for the input",
    },
    {
      label: "step",
      kind: CompletionItemKind.Property,
      detail: "Step value",
      insertText: 'step="${1:1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Step interval for the input",
    },
    {
      label: "pattern",
      kind: CompletionItemKind.Property,
      detail: "Validation pattern",
      insertText: 'pattern="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Regular expression for input validation",
    },
    {
      label: "minlength",
      kind: CompletionItemKind.Property,
      detail: "Minimum length",
      insertText: 'minlength="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Minimum number of characters",
    },
    {
      label: "maxlength",
      kind: CompletionItemKind.Property,
      detail: "Maximum length",
      insertText: 'maxlength="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Maximum number of characters",
    },

    // Link attributes
    {
      label: "href",
      kind: CompletionItemKind.Property,
      detail: "Hyperlink reference",
      insertText: 'href="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "URL of the linked resource",
    },
    {
      label: "target",
      kind: CompletionItemKind.Property,
      detail: "Link target",
      insertText: 'target="${1:_blank}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Where to open the linked document",
    },
    {
      label: "rel",
      kind: CompletionItemKind.Property,
      detail: "Relationship",
      insertText: 'rel="${1:noopener}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Relationship between current and linked document",
    },
    {
      label: "download",
      kind: CompletionItemKind.Property,
      detail: "Download link",
      insertText: 'download="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Specifies that the target will be downloaded",
    },

    // Media attributes
    {
      label: "src",
      kind: CompletionItemKind.Property,
      detail: "Source URL",
      insertText: 'src="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "URL of the media resource",
    },
    {
      label: "alt",
      kind: CompletionItemKind.Property,
      detail: "Alternative text",
      insertText: 'alt="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Alternative text for the media",
    },
    {
      label: "width",
      kind: CompletionItemKind.Property,
      detail: "Element width",
      insertText: 'width="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Width of the element",
    },
    {
      label: "height",
      kind: CompletionItemKind.Property,
      detail: "Element height",
      insertText: 'height="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Height of the element",
    },
    {
      label: "controls",
      kind: CompletionItemKind.Property,
      detail: "Media controls",
      insertText: "controls",
      documentation: "Show media controls",
    },
    {
      label: "autoplay",
      kind: CompletionItemKind.Property,
      detail: "Auto play",
      insertText: "autoplay",
      documentation: "Start playing the media automatically",
    },
    {
      label: "loop",
      kind: CompletionItemKind.Property,
      detail: "Loop playback",
      insertText: "loop",
      documentation: "Loop the media playback",
    },
    {
      label: "muted",
      kind: CompletionItemKind.Property,
      detail: "Muted audio",
      insertText: "muted",
      documentation: "Mute the audio by default",
    },
    {
      label: "poster",
      kind: CompletionItemKind.Property,
      detail: "Video poster",
      insertText: 'poster="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Image shown while video is downloading",
    },
    {
      label: "preload",
      kind: CompletionItemKind.Property,
      detail: "Preload behavior",
      insertText: 'preload="${1:auto}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "How the media should be preloaded",
    },

    // Table attributes
    {
      label: "colspan",
      kind: CompletionItemKind.Property,
      detail: "Column span",
      insertText: 'colspan="${1:1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Number of columns a cell should span",
    },
    {
      label: "rowspan",
      kind: CompletionItemKind.Property,
      detail: "Row span",
      insertText: 'rowspan="${1:1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Number of rows a cell should span",
    },
    {
      label: "scope",
      kind: CompletionItemKind.Property,
      detail: "Header scope",
      insertText: 'scope="${1:col}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Scope of a header cell",
    },
    {
      label: "headers",
      kind: CompletionItemKind.Property,
      detail: "Associated headers",
      insertText: 'headers="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "IDs of related header cells",
    },

    // Meta attributes
    {
      label: "charset",
      kind: CompletionItemKind.Property,
      detail: "Character encoding",
      insertText: 'charset="${1:UTF-8}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Character encoding for the document",
    },
    {
      label: "content",
      kind: CompletionItemKind.Property,
      detail: "Meta content",
      insertText: 'content="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Content of the meta element",
    },
    {
      label: "http-equiv",
      kind: CompletionItemKind.Property,
      detail: "HTTP equivalent",
      insertText: 'http-equiv="${1:refresh}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "HTTP header for the content attribute",
    },
    {
      label: "property",
      kind: CompletionItemKind.Property,
      detail: "Property name",
      insertText: 'property="${1:og:title}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Property name (for Open Graph, etc.)",
    },

    // Event attributes (common ones)
    {
      label: "onclick",
      kind: CompletionItemKind.Property,
      detail: "Click event",
      insertText: 'onclick="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "JavaScript to run on click",
    },
    {
      label: "onchange",
      kind: CompletionItemKind.Property,
      detail: "Change event",
      insertText: 'onchange="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "JavaScript to run on change",
    },
    {
      label: "onsubmit",
      kind: CompletionItemKind.Property,
      detail: "Submit event",
      insertText: 'onsubmit="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "JavaScript to run on form submit",
    },
    {
      label: "onload",
      kind: CompletionItemKind.Property,
      detail: "Load event",
      insertText: 'onload="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "JavaScript to run when element loads",
    },
    {
      label: "onerror",
      kind: CompletionItemKind.Property,
      detail: "Error event",
      insertText: 'onerror="${1}"',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "JavaScript to run on error",
    },
  ];

  // NEW: Common CSS Framework Classes (TailwindCSS examples)
  private cssClasses: CompletionItem[] = [
    // Layout classes
    {
      label: "container",
      kind: CompletionItemKind.Value,
      detail: "Container class",
      documentation: "Container with responsive max-width",
    },
    {
      label: "flex",
      kind: CompletionItemKind.Value,
      detail: "Flexbox container",
      documentation: "Display flex",
    },
    {
      label: "grid",
      kind: CompletionItemKind.Value,
      detail: "Grid container",
      documentation: "Display grid",
    },
    {
      label: "block",
      kind: CompletionItemKind.Value,
      detail: "Block display",
      documentation: "Display block",
    },
    {
      label: "inline",
      kind: CompletionItemKind.Value,
      detail: "Inline display",
      documentation: "Display inline",
    },
    {
      label: "inline-block",
      kind: CompletionItemKind.Value,
      detail: "Inline-block display",
      documentation: "Display inline-block",
    },
    {
      label: "hidden",
      kind: CompletionItemKind.Value,
      detail: "Hidden element",
      documentation: "Display none",
    },

    // Flexbox classes
    {
      label: "flex-col",
      kind: CompletionItemKind.Value,
      detail: "Flex column",
      documentation: "Flex direction column",
    },
    {
      label: "flex-row",
      kind: CompletionItemKind.Value,
      detail: "Flex row",
      documentation: "Flex direction row",
    },
    {
      label: "justify-center",
      kind: CompletionItemKind.Value,
      detail: "Justify center",
      documentation: "Justify content center",
    },
    {
      label: "justify-between",
      kind: CompletionItemKind.Value,
      detail: "Justify between",
      documentation: "Justify content space-between",
    },
    {
      label: "justify-around",
      kind: CompletionItemKind.Value,
      detail: "Justify around",
      documentation: "Justify content space-around",
    },
    {
      label: "items-center",
      kind: CompletionItemKind.Value,
      detail: "Items center",
      documentation: "Align items center",
    },
    {
      label: "items-start",
      kind: CompletionItemKind.Value,
      detail: "Items start",
      documentation: "Align items flex-start",
    },
    {
      label: "items-end",
      kind: CompletionItemKind.Value,
      detail: "Items end",
      documentation: "Align items flex-end",
    },

    // Typography classes
    {
      label: "text-xs",
      kind: CompletionItemKind.Value,
      detail: "Extra small text",
      documentation: "Font size 0.75rem",
    },
    {
      label: "text-sm",
      kind: CompletionItemKind.Value,
      detail: "Small text",
      documentation: "Font size 0.875rem",
    },
    {
      label: "text-base",
      kind: CompletionItemKind.Value,
      detail: "Base text size",
      documentation: "Font size 1rem",
    },
    {
      label: "text-lg",
      kind: CompletionItemKind.Value,
      detail: "Large text",
      documentation: "Font size 1.125rem",
    },
    {
      label: "text-xl",
      kind: CompletionItemKind.Value,
      detail: "Extra large text",
      documentation: "Font size 1.25rem",
    },
    {
      label: "text-2xl",
      kind: CompletionItemKind.Value,
      detail: "2X large text",
      documentation: "Font size 1.5rem",
    },
    {
      label: "text-3xl",
      kind: CompletionItemKind.Value,
      detail: "3X large text",
      documentation: "Font size 1.875rem",
    },
    {
      label: "text-center",
      kind: CompletionItemKind.Value,
      detail: "Center text",
      documentation: "Text align center",
    },
    {
      label: "text-left",
      kind: CompletionItemKind.Value,
      detail: "Left text",
      documentation: "Text align left",
    },
    {
      label: "text-right",
      kind: CompletionItemKind.Value,
      detail: "Right text",
      documentation: "Text align right",
    },
    {
      label: "font-thin",
      kind: CompletionItemKind.Value,
      detail: "Thin font",
      documentation: "Font weight 100",
    },
    {
      label: "font-light",
      kind: CompletionItemKind.Value,
      detail: "Light font",
      documentation: "Font weight 300",
    },
    {
      label: "font-normal",
      kind: CompletionItemKind.Value,
      detail: "Normal font",
      documentation: "Font weight 400",
    },
    {
      label: "font-medium",
      kind: CompletionItemKind.Value,
      detail: "Medium font",
      documentation: "Font weight 500",
    },
    {
      label: "font-semibold",
      kind: CompletionItemKind.Value,
      detail: "Semibold font",
      documentation: "Font weight 600",
    },
    {
      label: "font-bold",
      kind: CompletionItemKind.Value,
      detail: "Bold font weight",
      documentation: "Font weight 700",
    },

    // Colors
    {
      label: "text-white",
      kind: CompletionItemKind.Value,
      detail: "White text",
      documentation: "Text color white",
    },
    {
      label: "text-black",
      kind: CompletionItemKind.Value,
      detail: "Black text",
      documentation: "Text color black",
    },
    {
      label: "text-gray-500",
      kind: CompletionItemKind.Value,
      detail: "Gray text",
      documentation: "Text color gray 500",
    },
    {
      label: "text-blue-500",
      kind: CompletionItemKind.Value,
      detail: "Blue text",
      documentation: "Text color blue 500",
    },
    {
      label: "text-red-500",
      kind: CompletionItemKind.Value,
      detail: "Red text",
      documentation: "Text color red 500",
    },
    {
      label: "text-green-500",
      kind: CompletionItemKind.Value,
      detail: "Green text",
      documentation: "Text color green 500",
    },

    // Background colors
    {
      label: "bg-white",
      kind: CompletionItemKind.Value,
      detail: "White background",
      documentation: "Background color white",
    },
    {
      label: "bg-black",
      kind: CompletionItemKind.Value,
      detail: "Black background",
      documentation: "Background color black",
    },
    {
      label: "bg-gray-100",
      kind: CompletionItemKind.Value,
      detail: "Light gray background",
      documentation: "Background color gray 100",
    },
    {
      label: "bg-gray-500",
      kind: CompletionItemKind.Value,
      detail: "Gray background",
      documentation: "Background color gray 500",
    },
    {
      label: "bg-blue-500",
      kind: CompletionItemKind.Value,
      detail: "Blue background",
      documentation: "Background color blue 500",
    },
    {
      label: "bg-red-500",
      kind: CompletionItemKind.Value,
      detail: "Red background",
      documentation: "Background color red 500",
    },

    // Spacing - Margin
    {
      label: "m-0",
      kind: CompletionItemKind.Value,
      detail: "Margin 0",
      documentation: "Margin 0",
    },
    {
      label: "m-1",
      kind: CompletionItemKind.Value,
      detail: "Margin 0.25rem",
      documentation: "Margin 0.25rem",
    },
    {
      label: "m-2",
      kind: CompletionItemKind.Value,
      detail: "Margin 0.5rem",
      documentation: "Margin 0.5rem",
    },
    {
      label: "m-4",
      kind: CompletionItemKind.Value,
      detail: "Margin 1rem",
      documentation: "Margin 1rem",
    },
    {
      label: "m-8",
      kind: CompletionItemKind.Value,
      detail: "Margin 2rem",
      documentation: "Margin 2rem",
    },
    {
      label: "mx-auto",
      kind: CompletionItemKind.Value,
      detail: "Horizontal margin auto",
      documentation: "Horizontal margin auto",
    },
    {
      label: "mt-4",
      kind: CompletionItemKind.Value,
      detail: "Margin top 1rem",
      documentation: "Margin top 1rem",
    },
    {
      label: "mb-4",
      kind: CompletionItemKind.Value,
      detail: "Margin bottom 1rem",
      documentation: "Margin bottom 1rem",
    },
    {
      label: "ml-4",
      kind: CompletionItemKind.Value,
      detail: "Margin left 1rem",
      documentation: "Margin left 1rem",
    },
    {
      label: "mr-4",
      kind: CompletionItemKind.Value,
      detail: "Margin right 1rem",
      documentation: "Margin right 1rem",
    },

    // Spacing - Padding
    {
      label: "p-0",
      kind: CompletionItemKind.Value,
      detail: "Padding 0",
      documentation: "Padding 0",
    },
    {
      label: "p-1",
      kind: CompletionItemKind.Value,
      detail: "Padding 0.25rem",
      documentation: "Padding 0.25rem",
    },
    {
      label: "p-2",
      kind: CompletionItemKind.Value,
      detail: "Padding 0.5rem",
      documentation: "Padding 0.5rem",
    },
    {
      label: "p-4",
      kind: CompletionItemKind.Value,
      detail: "Padding 1rem",
      documentation: "Padding 1rem",
    },
    {
      label: "p-8",
      kind: CompletionItemKind.Value,
      detail: "Padding 2rem",
      documentation: "Padding 2rem",
    },
    {
      label: "pt-4",
      kind: CompletionItemKind.Value,
      detail: "Padding top 1rem",
      documentation: "Padding top 1rem",
    },
    {
      label: "pb-4",
      kind: CompletionItemKind.Value,
      detail: "Padding bottom 1rem",
      documentation: "Padding bottom 1rem",
    },
    {
      label: "pl-4",
      kind: CompletionItemKind.Value,
      detail: "Padding left 1rem",
      documentation: "Padding left 1rem",
    },
    {
      label: "pr-4",
      kind: CompletionItemKind.Value,
      detail: "Padding right 1rem",
      documentation: "Padding right 1rem",
    },

    // Width and Height
    {
      label: "w-full",
      kind: CompletionItemKind.Value,
      detail: "Full width",
      documentation: "Width 100%",
    },
    {
      label: "w-1/2",
      kind: CompletionItemKind.Value,
      detail: "Half width",
      documentation: "Width 50%",
    },
    {
      label: "w-1/3",
      kind: CompletionItemKind.Value,
      detail: "One third width",
      documentation: "Width 33.333%",
    },
    {
      label: "w-auto",
      kind: CompletionItemKind.Value,
      detail: "Auto width",
      documentation: "Width auto",
    },
    {
      label: "h-full",
      kind: CompletionItemKind.Value,
      detail: "Full height",
      documentation: "Height 100%",
    },
    {
      label: "h-screen",
      kind: CompletionItemKind.Value,
      detail: "Screen height",
      documentation: "Height 100vh",
    },
    {
      label: "h-auto",
      kind: CompletionItemKind.Value,
      detail: "Auto height",
      documentation: "Height auto",
    },

    // Borders
    {
      label: "border",
      kind: CompletionItemKind.Value,
      detail: "Border",
      documentation: "Border 1px solid",
    },
    {
      label: "border-2",
      kind: CompletionItemKind.Value,
      detail: "Border 2px",
      documentation: "Border 2px solid",
    },
    {
      label: "border-none",
      kind: CompletionItemKind.Value,
      detail: "No border",
      documentation: "Border none",
    },
    {
      label: "rounded",
      kind: CompletionItemKind.Value,
      detail: "Rounded corners",
      documentation: "Border radius 0.25rem",
    },
    {
      label: "rounded-lg",
      kind: CompletionItemKind.Value,
      detail: "Large rounded corners",
      documentation: "Border radius 0.5rem",
    },
    {
      label: "rounded-full",
      kind: CompletionItemKind.Value,
      detail: "Fully rounded",
      documentation: "Border radius 9999px",
    },

    // Shadow
    {
      label: "shadow",
      kind: CompletionItemKind.Value,
      detail: "Box shadow",
      documentation: "Box shadow small",
    },
    {
      label: "shadow-lg",
      kind: CompletionItemKind.Value,
      detail: "Large box shadow",
      documentation: "Box shadow large",
    },
    {
      label: "shadow-none",
      kind: CompletionItemKind.Value,
      detail: "No shadow",
      documentation: "Box shadow none",
    },

    // Position
    {
      label: "relative",
      kind: CompletionItemKind.Value,
      detail: "Relative position",
      documentation: "Position relative",
    },
    {
      label: "absolute",
      kind: CompletionItemKind.Value,
      detail: "Absolute position",
      documentation: "Position absolute",
    },
    {
      label: "fixed",
      kind: CompletionItemKind.Value,
      detail: "Fixed position",
      documentation: "Position fixed",
    },
    {
      label: "sticky",
      kind: CompletionItemKind.Value,
      detail: "Sticky position",
      documentation: "Position sticky",
    },

    // Responsive prefixes (examples)
    {
      label: "sm:text-lg",
      kind: CompletionItemKind.Value,
      detail: "Small screen large text",
      documentation: "Large text on small screens and up",
    },
    {
      label: "md:flex",
      kind: CompletionItemKind.Value,
      detail: "Medium screen flex",
      documentation: "Flex display on medium screens and up",
    },
    {
      label: "lg:grid",
      kind: CompletionItemKind.Value,
      detail: "Large screen grid",
      documentation: "Grid display on large screens and up",
    },
  ];

  private edgeSpecialVariables: CompletionItem[] = [
    {
      label: "$loop",
      kind: CompletionItemKind.Variable,
      detail: "Loop context object",
      documentation: {
        kind: "markdown",
        value:
          "Provides access to loop context:\n" +
          "- index: Current iteration (0-based)\n" +
          "- iteration: Current iteration (1-based)\n" +
          "- length: Total length of the iterable\n" +
          "- first: True if first iteration\n" +
          "- last: True if last iteration\n" +
          "- remaining: Number of iterations remaining\n" +
          "- depth: Nesting level of the loop",
      },
    },
    {
      label: "$slot",
      kind: CompletionItemKind.Variable,
      detail: "Slot context object",
      documentation: "Access named slots and their content within components.",
    },
  ];

  private commonSlots: CompletionItem[] = [
    {
      label: "main",
      kind: CompletionItemKind.Value,
      detail: "Main content slot",
      documentation: "The default slot for component content.",
    },
    {
      label: "header",
      kind: CompletionItemKind.Value,
      detail: "Header slot",
      documentation: "Commonly used for header content in layouts/components.",
    },
    {
      label: "footer",
      kind: CompletionItemKind.Value,
      detail: "Footer slot",
      documentation: "Commonly used for footer content in layouts/components.",
    },
  ];

  // NEW: Enhanced completion provider with HTML context detection
  provideCompletions(
    document: TextDocument,
    position: Position,
  ): CompletionItem[] {
    const text = document.getText();
    const offset = document.offsetAt(position);

    // Check if we're inside interpolation context first
    if (this.isInsideInterpolation(document, position)) {
      return this.getInterpolationCompletions();
    }

    const lineText = document.getText({
      start: { line: position.line, character: 0 },
      end: { line: position.line, character: position.character },
    });

    // Check for @ character (EdgeJS directives)
    const atIndex = lineText.lastIndexOf("@");
    if (atIndex !== -1 && atIndex < position.character) {
      return this.getEdgeDirectiveCompletions(document, position, lineText);
    }

    // NEW: Check if we're typing an HTML tag
    if (this.isTypingHtmlTag(lineText)) {
      return this.getHtmlTagCompletions(lineText, document, position);
    }

    // NEW: Check if we're typing HTML attributes
    if (this.isTypingHtmlAttribute(lineText)) {
      return this.getHtmlAttributeCompletions(lineText);
    }

    // NEW: Check if we're typing CSS classes
    if (this.isTypingCssClass(lineText)) {
      return this.cssClasses;
    }

    // Parse document for more context-aware completions
    try {
      const tree = this.edgeParser.parse(text);
      const node = this.edgeParser.getNodeAtPosition(
        tree,
        position.line,
        position.character,
      );

      if (node && this.isInsideString(node)) {
        return this.getPathCompletions();
      }
    } catch (error) {
      // If parsing fails, fall back to basic completions
    }

    // NEW: Default context - return both EdgeJS and HTML completions
    return [...this.edgeDirectives, ...this.htmlTags];
  }

  // NEW: Context detection methods
  private isTypingHtmlTag(lineText: string): boolean {
    // Check if we're after < and before any space or >
    const tagMatch = lineText.match(/<\s*([a-zA-Z]*)$/);
    return tagMatch !== null;
  }

  private getHtmlTagCompletions(lineText: string, document: TextDocument, position: Position): CompletionItem[] {
    // Extract the tag name that's being typed after the <
    const tagMatch = lineText.match(/<\s*([a-zA-Z]*)$/);
    if (!tagMatch) return this.htmlTags;
    
    const fullMatch = tagMatch[0]; // e.g., "<h3"
    const tagName = tagMatch[1]; // e.g., "h3"
    
    // Calculate the range to replace (from where the tag name starts to current cursor)
    const lineStart = { line: position.line, character: 0 };
    const lineTextFull = document.getText({
      start: lineStart,
      end: { line: position.line, character: position.character },
    });
    
    // Find the start position of the text to be replaced
    const matchStartIndex = lineTextFull.lastIndexOf(fullMatch);
    const replaceStart = { 
      line: position.line, 
      character: matchStartIndex 
    };
    const replaceEnd = position; // current cursor position
    
    const replaceRange = Range.create(replaceStart, replaceEnd);

    // Get the current line's leading whitespace to match indentation
    const currentLine = document.getText({
      start: { line: position.line, character: 0 },
      end: { line: position.line, character: lineTextFull.length }
    });
    const leadingWhitespaceMatch = currentLine.match(/^(\s*)/);
    const currentIndentation = leadingWhitespaceMatch ? leadingWhitespaceMatch[1] : '';

    // Filter HTML tags that match the typed prefix and set up proper text edits
    return this.htmlTags
      .filter(item => item.label.toLowerCase().startsWith(tagName.toLowerCase()))
      .map(item => {
        let insertText = item.insertText || item.label;
        
        // Adjust indentation for multiline tags to match the current line's indentation
        // The insertText contains literal \n characters (not actual newlines)
        if (insertText.includes('\\n')) {
          // For multiline content, add the current indentation level to each line after the first
          const lines = insertText.split('\\n');
          const adjustedLines = lines.map((line, index) => {
            if (index === 0) {
              // First line keeps the original content
              return line;
            } else {
              // For subsequent lines, we need to preserve the original relative indentation
              // and add the current context indentation
              const originalLine = line;
              const originalLeadingSpaces = originalLine.match(/^(\s*)/);
              const originalIndent = originalLeadingSpaces ? originalLeadingSpaces[1] : '';
              
              // For list items, form elements, etc., they originally have 2 spaces as indentation
              // We replace that with the current indentation level
              return currentIndentation + originalLine.trim();
            }
          });
          insertText = adjustedLines.join('\\n');
        }
        
        // Create proper text edit that replaces the entire match (e.g., "<h3") with the full tag
        return {
          ...item,
          textEdit: TextEdit.replace(replaceRange, insertText),
          insertText: undefined,
        };
      });
  }

  private isTypingHtmlAttribute(lineText: string): boolean {
    // Check if we're inside an HTML tag but not in a quoted value
    const inTag = lineText.lastIndexOf("<") > lineText.lastIndexOf(">");
    if (!inTag) return false;

    // Not in a quoted attribute value
    const quotes = (lineText.match(/"/g) || []).length;
    return quotes % 2 === 0;
  }

  private isTypingCssClass(lineText: string): boolean {
    // Check if we're inside class="..."
    const classMatch = lineText.match(/class\s*=\s*"([^"]*)?$/);
    return classMatch !== null;
  }

  private getHtmlAttributeCompletions(lineText: string): CompletionItem[] {
    // Detect the specific HTML tag and return only relevant attributes
    const tagMatch = lineText.match(/<\s*([a-zA-Z]+)/);
    const tagName = tagMatch ? tagMatch[1].toLowerCase() : "";

    // Filter attributes based on tag context
    let relevantAttributes = [...this.htmlAttributes];

    if (tagName === "input") {
      // Add input-specific attributes
      relevantAttributes.unshift({
        label: "type",
        kind: CompletionItemKind.Property,
        detail: "Input type (text, email, password, etc.)",
        insertText: 'type="${1:text}"',
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "Type of input control",
      });
    } else if (tagName === "a") {
      // Prioritize href for anchor tags
      relevantAttributes.unshift({
        label: "href",
        kind: CompletionItemKind.Property,
        detail: "Link destination",
        insertText: 'href="${1}"',
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "URL of the linked resource",
      });
    } else if (tagName === "img") {
      // Prioritize src and alt for images
      relevantAttributes.unshift(
        {
          label: "src",
          kind: CompletionItemKind.Property,
          detail: "Image source",
          insertText: 'src="${1}"',
          insertTextFormat: InsertTextFormat.Snippet,
          documentation: "URL of the image",
        },
        {
          label: "alt",
          kind: CompletionItemKind.Property,
          detail: "Alternative text",
          insertText: 'alt="${1}"',
          insertTextFormat: InsertTextFormat.Snippet,
          documentation: "Alternative text for the image",
        },
      );
    }

    return relevantAttributes;
  }

  private getEdgeDirectiveCompletions(
    document: TextDocument,
    position: Position,
    lineText: string,
  ): CompletionItem[] {
    const fullLine = document.getText({
      start: { line: position.line, character: 0 },
      end: { line: position.line + 1, character: 0 },
    });

    const afterCursor = fullLine
      .substring(position.character)
      .replace(/\n$/, "");

    const replaceRange = Range.create(
      { line: position.line, character: 0 },
      { line: position.line, character: fullLine.length - 1 },
    );

    return this.edgeDirectives
      .filter((item) => item.label.startsWith("@"))
      .map((item) => {
        let fullText = item.insertText || item.label;
        if (afterCursor.length > 0) {
          fullText = fullText + afterCursor;
        }

        return {
          ...item,
          textEdit: TextEdit.replace(replaceRange, fullText),
          insertText: undefined,
          insertTextFormat: item.insertTextFormat || InsertTextFormat.Snippet,
        };
      });
  }

  private createCompletionItem(
    item: CompletionItem,
    indentation: string,
  ): CompletionItem {
    let insertText = item.insertText || item.label;

    // Ensure it starts with @
    if (!insertText.startsWith("@")) {
      insertText = "@" + insertText;
    }

    // Add indentation to multiline content
    insertText = insertText
      .split("\n")
      .map((line, index) => {
        if (index === 0) return line;
        return indentation + line;
      })
      .join("\n");

    return {
      ...item,
      insertText,
    };
  }

  private isInsideInterpolation(
    document: TextDocument,
    position: Position,
  ): boolean {
    const text = document.getText();
    const offset = document.offsetAt(position);
    let inInterpolation = false;
    let i = 0;

    while (i < offset) {
      if (i < text.length - 1) {
        if (text[i] === "{" && text[i + 1] === "{") {
          inInterpolation = true;
          i += 2;
          continue;
        }
        if (text[i] === "}" && text[i + 1] === "}") {
          inInterpolation = false;
          i += 2;
          continue;
        }
      }
      i++;
    }

    return inInterpolation;
  }

  private isInsideString(node: any): boolean {
    return node.type === "string";
  }

  private adonisJsHelpers: CompletionItem[] = [
    {
      label: "route",
      kind: CompletionItemKind.Function,
      detail: "Generate URL for named route",
      insertText: "route('${1:routeName}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Generate URL for a named route",
    },
    {
      label: "signedRoute",
      kind: CompletionItemKind.Function,
      detail: "Generate signed URL for named route",
      insertText: "signedRoute('${1:routeName}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Generate signed URL for a named route",
    },
    {
      label: "request",
      kind: CompletionItemKind.Variable,
      detail: "HTTP request object",
      documentation: "Reference to the ongoing HTTP request instance",
    },
    {
      label: "auth",
      kind: CompletionItemKind.Variable,
      detail: "Authentication object",
      documentation:
        "Reference to ctx.auth property for accessing logged-in user information",
    },
    {
      label: "config",
      kind: CompletionItemKind.Function,
      detail: "Get configuration value",
      insertText: "config('${1:key}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Helper function to reference configuration values",
    },
    {
      label: "session",
      kind: CompletionItemKind.Function,
      detail: "Get session value",
      insertText: "session('${1:key}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Read-only copy of the session object",
    },
    {
      label: "flashMessages",
      kind: CompletionItemKind.Variable,
      detail: "Session flash messages",
      documentation: "Read-only copy of session flash messages",
    },
  ];

  private propsHelpers: CompletionItem[] = [
    {
      label: "$props.toAttrs",
      kind: CompletionItemKind.Method,
      detail: "Convert props to HTML attributes",
      insertText: "$props.toAttrs()",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Convert props object to HTML attributes string",
    },
    {
      label: "$props.merge",
      kind: CompletionItemKind.Method,
      detail: "Merge props with defaults",
      insertText: "$props.merge(${1:defaults})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Merge props object with default values",
    },
    {
      label: "$props.only",
      kind: CompletionItemKind.Method,
      detail: "Extract specific props",
      insertText: "$props.only([${1:keys}])",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Extract only specified props from props object",
    },
    {
      label: "$props.except",
      kind: CompletionItemKind.Method,
      detail: "Exclude specific props",
      insertText: "$props.except([${1:keys}])",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Exclude specified props from props object",
    },
    {
      label: "$props.get",
      kind: CompletionItemKind.Method,
      detail: "Get property value",
      insertText: "$props.get('${1:key}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Get a property value from props",
    },
  ];

  private htmlHelpers: CompletionItem[] = [
    {
      label: "html.escape",
      kind: CompletionItemKind.Function,
      detail: "Escape HTML",
      insertText: "html.escape(${1:html})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Escape HTML characters in string",
    },
    {
      label: "html.safe",
      kind: CompletionItemKind.Function,
      detail: "Mark as safe HTML",
      insertText: "html.safe(${1:html})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Mark string as safe HTML (unescaped)",
    },
    {
      label: "html.classNames",
      kind: CompletionItemKind.Function,
      detail: "Generate CSS class names",
      insertText: "html.classNames(${1:classes})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Generate CSS class names from object or array",
    },
    {
      label: "html.attrs",
      kind: CompletionItemKind.Function,
      detail: "Generate HTML attributes",
      insertText: "html.attrs(${1:attributes})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Generate HTML attributes from object",
    },
  ];

  private stringHelpers: CompletionItem[] = [
    {
      label: "camelCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to camelCase",
      insertText: "camelCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Convert string to camelCase",
    },
    {
      label: "snakeCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to snake_case",
      insertText: "snakeCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Convert string to snake_case",
    },
    {
      label: "dashCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to dash-case",
      insertText: "dashCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Convert string to dash-case",
    },
    {
      label: "pascalCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to PascalCase",
      insertText: "pascalCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Convert string to PascalCase",
    },
  ];

  private textHelpers: CompletionItem[] = [
    {
      label: "nl2br",
      kind: CompletionItemKind.Function,
      detail: "Convert newlines to <br> tags",
      insertText: "nl2br(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Convert newlines to HTML <br> tags",
    },
    {
      label: "truncate",
      kind: CompletionItemKind.Function,
      detail: "Truncate text",
      insertText: "truncate(${1:text}, ${2:length})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Truncate text to specified length",
    },
    {
      label: "excerpt",
      kind: CompletionItemKind.Function,
      detail: "Create excerpt from text",
      insertText: "excerpt(${1:text}, ${2:length})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Create excerpt from text",
    },
  ];

  private debugHelpers: CompletionItem[] = [
    {
      label: "inspect",
      kind: CompletionItemKind.Function,
      detail: "Inspect and debug values",
      insertText: "inspect(${1:value})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Inspect and output a value for debugging purposes",
    },
  ];

  private getInterpolationCompletions(): CompletionItem[] {
    // Define global helpers that should be available in interpolation context
    const globalHelpers: CompletionItem[] = [
      {
        label: "asset",
        kind: CompletionItemKind.Function,
        detail: "Asset helper",
        insertText: "asset(${1:path})",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "Asset helper",
      },
      {
        label: "url",
        kind: CompletionItemKind.Function,
        detail: "URL helper",
        insertText: "url(${1:path})",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "URL helper",
      },
      {
        label: "csrfField",
        kind: CompletionItemKind.Function,
        detail: "CSRF field helper",
        insertText: "csrfField()",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "CSRF field helper",
      },
      {
        label: "csrfToken",
        kind: CompletionItemKind.Function,
        detail: "CSRF token helper",
        insertText: "csrfToken()",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "CSRF token helper",
      },
      {
        label: "flash",
        kind: CompletionItemKind.Function,
        detail: "Flash message helper",
        insertText: "flash(${1:key})",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "Flash message helper",
      },
      {
        label: "old",
        kind: CompletionItemKind.Function,
        detail: "Old input helper",
        insertText: "old(${1:field})",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "Old input helper",
      },
      {
        label: "errors",
        kind: CompletionItemKind.Variable,
        detail: "Errors object",
        documentation: "Errors object",
      },
      {
        label: "env",
        kind: CompletionItemKind.Function,
        detail: "Environment variable helper",
        insertText: "env(${1:variable})",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "Environment variable helper",
      },
      {
        label: "app",
        kind: CompletionItemKind.Variable,
        detail: "Application instance",
        documentation: "Application instance",
      },
      {
        label: "view",
        kind: CompletionItemKind.Variable,
        detail: "View context",
        documentation: "View context",
      },
      {
        label: "response",
        kind: CompletionItemKind.Variable,
        detail: "Response object",
        documentation: "Response object",
      },
      {
        label: "redirect",
        kind: CompletionItemKind.Function,
        detail: "Redirect helper",
        insertText: "redirect(${1:path})",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "Redirect helper",
      },
      {
        label: "abort",
        kind: CompletionItemKind.Function,
        detail: "Abort helper",
        insertText: "abort()",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "Abort helper",
      },
      {
        label: "cache",
        kind: CompletionItemKind.Function,
        detail: "Cache helper",
        insertText: "cache()",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "Cache helper",
      },
      {
        label: "date",
        kind: CompletionItemKind.Function,
        detail: "Date helper",
        insertText: "date()",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "Date helper",
      },
      {
        label: "inspect",
        kind: CompletionItemKind.Function,
        detail: "Inspect helper",
        insertText: "inspect(${1:value})",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "Inspect helper",
      },
      {
        label: "paginator",
        kind: CompletionItemKind.Variable,
        detail: "Paginator object",
        documentation: "Paginator object",
      },
      {
        label: "cspNonce",
        kind: CompletionItemKind.Variable,
        detail: "CSP nonce",
        documentation: "CSP nonce",
      },
      {
        label: "t",
        kind: CompletionItemKind.Function,
        detail: "Translation helper",
        insertText: "t(${1:key})",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "Translation helper",
      },
    ];

    return [
      ...this.edgeSpecialVariables,
      ...this.adonisJsHelpers,
      ...this.propsHelpers,
      ...this.htmlHelpers,
      ...this.stringHelpers,
      ...this.textHelpers,
      ...this.debugHelpers,
      ...globalHelpers,
    ];
  }

  private getPathCompletions(): CompletionItem[] {
    return this.commonSlots;
  }
}

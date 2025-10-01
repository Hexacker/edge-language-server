import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position, SignatureHelp, SignatureInformation, ParameterInformation } from 'vscode-languageserver/node';
import { EdgeParser } from '../server/parser';

// Define signature information for Edge helpers and functions
const SIGNATURES: SignatureInformation[] = [
  // Original signatures
  {
    label: "route(routeName: string, params?: object): string",
    documentation: "Generate a URL for a named route",
    parameters: [
      {
        label: "routeName",
        documentation: "The name of the route"
      },
      {
        label: "params",
        documentation: "Optional parameters to pass to the route"
      }
    ]
  },
  {
    label: "asset(path: string): string",
    documentation: "Generate a URL for an asset file",
    parameters: [
      {
        label: "path",
        documentation: "The path to the asset file"
      }
    ]
  },
  {
    label: "config(key: string, defaultValue?: any): any",
    documentation: "Get a configuration value",
    parameters: [
      {
        label: "key",
        documentation: "The configuration key"
      },
      {
        label: "defaultValue",
        documentation: "Optional default value if key doesn't exist"
      }
    ]
  },
  {
    label: "auth(): object",
    documentation: "Get the current authentication object",
    parameters: []
  },
  {
    label: "request(): object",
    documentation: "Get the current HTTP request object",
    parameters: []
  },
  {
    label: "session(key?: string, defaultValue?: any): any",
    documentation: "Get session data",
    parameters: [
      {
        label: "key",
        documentation: "Optional key to get a specific session value"
      },
      {
        label: "defaultValue",
        documentation: "Optional default value if key doesn't exist"
      }
    ]
  },
  {
    label: "flash(key?: string): any",
    documentation: "Get flash data from the session",
    parameters: [
      {
        label: "key",
        documentation: "Optional key to get a specific flash value"
      }
    ]
  },
  {
    label: "old(key: string, defaultValue?: any): any",
    documentation: "Get old input data from the previous request",
    parameters: [
      {
        label: "key",
        documentation: "The key to get the old input value"
      },
      {
        label: "defaultValue",
        documentation: "Optional default value if key doesn't exist"
      }
    ]
  },
  {
    label: "url(path?: string): string",
    documentation: "Generate a URL for the application",
    parameters: [
      {
        label: "path",
        documentation: "Optional path to append to the base URL"
      }
    ]
  },
  {
    label: "csrfField(): string",
    documentation: "Generate a CSRF hidden input field",
    parameters: []
  },
  {
    label: "csrfToken(): string",
    documentation: "Get the current CSRF token",
    parameters: []
  },
  
  // New EdgeJS signatures
  {
    label: "signedRoute(routeName: string, params?: object, expiresIn?: string): string",
    documentation: "Generate a signed URL for a named route",
    parameters: [
      {
        label: "routeName",
        documentation: "The name of the route"
      },
      {
        label: "params",
        documentation: "Optional parameters to pass to the route"
      },
      {
        label: "expiresIn",
        documentation: "Optional expiration time for the signature"
      }
    ]
  },
  {
    label: "t(key: string, ...args: any[]): string",
    documentation: "Translate a string using the i18n system",
    parameters: [
      {
        label: "key",
        documentation: "The translation key"
      },
      {
        label: "...args",
        documentation: "Optional arguments to pass to the translation"
      }
    ]
  },
  {
    label: "toAttrs(props: object): string",
    documentation: "Convert props object to HTML attributes string",
    parameters: [
      {
        label: "props",
        documentation: "Props object to convert to attributes"
      }
    ]
  },
  {
    label: "merge(props: object, defaults: object): object",
    documentation: "Merge props object with default values",
    parameters: [
      {
        label: "props",
        documentation: "Props object to merge"
      },
      {
        label: "defaults",
        documentation: "Default values to merge with"
      }
    ]
  },
  {
    label: "only(props: object, keys: string[]): object",
    documentation: "Extract only specified props from props object",
    parameters: [
      {
        label: "props",
        documentation: "Props object to extract from"
      },
      {
        label: "keys",
        documentation: "Array of keys to extract"
      }
    ]
  },
  {
    label: "except(props: object, keys: string[]): object",
    documentation: "Exclude specified props from props object",
    parameters: [
      {
        label: "props",
        documentation: "Props object to exclude from"
      },
      {
        label: "keys",
        documentation: "Array of keys to exclude"
      }
    ]
  },
  {
    label: "nl2br(text: string): string",
    documentation: "Convert newlines to <br> tags",
    parameters: [
      {
        label: "text",
        documentation: "Text to convert newlines in"
      }
    ]
  },
  {
    label: "truncate(text: string, length: number, suffix?: string): string",
    documentation: "Truncate text to specified length",
    parameters: [
      {
        label: "text",
        documentation: "Text to truncate"
      },
      {
        label: "length",
        documentation: "Maximum length of truncated text"
      },
      {
        label: "suffix",
        documentation: "Optional suffix to append to truncated text"
      }
    ]
  },
  {
    label: "excerpt(text: string, length: number, options?: object): string",
    documentation: "Create excerpt from text",
    parameters: [
      {
        label: "text",
        documentation: "Text to create excerpt from"
      },
      {
        label: "length",
        documentation: "Length of excerpt"
      },
      {
        label: "options",
        documentation: "Optional options for excerpt creation"
      }
    ]
  },
  {
    label: "escape(html: string): string",
    documentation: "Escape HTML entities",
    parameters: [
      {
        label: "html",
        documentation: "HTML string to escape"
      }
    ]
  },
  {
    label: "safe(html: string): string",
    documentation: "Mark HTML as safe (no escaping)",
    parameters: [
      {
        label: "html",
        documentation: "HTML string to mark as safe"
      }
    ]
  },
  {
    label: "classNames(...classes: (string | object | boolean)[]): string",
    documentation: "Generate CSS class names from arguments",
    parameters: [
      {
        label: "...classes",
        documentation: "Class names or objects with class names as keys"
      }
    ]
  },
  {
    label: "attrs(attributes: object): string",
    documentation: "Generate HTML attributes from object",
    parameters: [
      {
        label: "attributes",
        documentation: "Object with attribute names as keys and values as values"
      }
    ]
  },
  {
    label: "camelCase(text: string): string",
    documentation: "Convert text to camelCase",
    parameters: [
      {
        label: "text",
        documentation: "Text to convert to camelCase"
      }
    ]
  },
  {
    label: "snakeCase(text: string): string",
    documentation: "Convert text to snake_case",
    parameters: [
      {
        label: "text",
        documentation: "Text to convert to snake_case"
      }
    ]
  },
  {
    label: "dashCase(text: string): string",
    documentation: "Convert text to dash-case",
    parameters: [
      {
        label: "text",
        documentation: "Text to convert to dash-case"
      }
    ]
  },
  {
    label: "pascalCase(text: string): string",
    documentation: "Convert text to PascalCase",
    parameters: [
      {
        label: "text",
        documentation: "Text to convert to PascalCase"
      }
    ]
  },
  {
    label: "titleCase(text: string): string",
    documentation: "Convert text to Title Case",
    parameters: [
      {
        label: "text",
        documentation: "Text to convert to Title Case"
      }
    ]
  },
  {
    label: "capitalCase(text: string): string",
    documentation: "Convert text to Capital Case",
    parameters: [
      {
        label: "text",
        documentation: "Text to convert to Capital Case"
      }
    ]
  },
  {
    label: "prettyMs(milliseconds: number): string",
    documentation: "Format milliseconds as human-readable time",
    parameters: [
      {
        label: "milliseconds",
        documentation: "Number of milliseconds to format"
      }
    ]
  },
  {
    label: "toBytes(size: string): number",
    documentation: "Convert size string to bytes",
    parameters: [
      {
        label: "size",
        documentation: "Size string (e.g. '1KB', '2MB')"
      }
    ]
  },
  {
    label: "ordinal(number: number): string",
    documentation: "Convert number to ordinal (1st, 2nd, 3rd, etc.)",
    parameters: [
      {
        label: "number",
        documentation: "Number to convert to ordinal"
      }
    ]
  }
];

export class EdgeSignatureHelpProvider {
  constructor(private edgeParser: EdgeParser) {}

  provideSignatureHelp(document: TextDocument, position: Position): SignatureHelp | null {
    const text = document.getText();
    const tree: any = this.edgeParser.parse(text);
    const node: any = this.edgeParser.getNodeAtPosition(tree, position.line, position.character);

    if (!node) return null;

    // Check if we're inside a function call
    const functionCall = this.findFunctionCall(node);
    if (!functionCall) return null;

    // Get the function name
    const functionName = this.getFunctionName(functionCall);
    if (!functionName) return null;

    // Find matching signature
    const signature = SIGNATURES.find(sig => 
      sig.label.startsWith(functionName + "(")
    );

    if (!signature) return null;

    return {
      signatures: [signature],
      activeSignature: 0,
      activeParameter: this.getActiveParameter(functionCall, position, document)
    };
  }

  private findFunctionCall(node: any): any | null {
    let currentNode: any = node;
    while (currentNode) {
      if (currentNode.type === 'call_expression') {
        return currentNode;
      }
      currentNode = currentNode.parent;
    }
    return null;
  }

  private getFunctionName(functionCall: any): string | null {
    const functionNode = functionCall.children.find((child: any) => 
      child.type === 'identifier' || child.type === 'member_expression'
    );
    
    if (!functionNode) return null;
    
    // For simplicity, we'll just return the text of the function node
    // In a more complex implementation, we'd handle member expressions differently
    return functionNode.text;
  }

  private getActiveParameter(functionCall: any, position: Position, document: TextDocument): number {
    // Count commas before the current position to determine which parameter we're on
    const text = document.getText();
    const functionStart = functionCall.startIndex;
    const currentPosition = document.offsetAt(position);
    
    // Find the opening parenthesis
    const openParenIndex = text.indexOf('(', functionStart);
    if (openParenIndex === -1 || currentPosition <= openParenIndex) {
      return 0;
    }
    
    // Count commas between opening parenthesis and current position
    let commaCount = 0;
    for (let i = openParenIndex + 1; i < currentPosition && i < text.length; i++) {
      if (text[i] === ',') {
        commaCount++;
      }
      // Stop if we encounter a closing parenthesis
      if (text[i] === ')') {
        break;
      }
    }
    
    return commaCount;
  }
}
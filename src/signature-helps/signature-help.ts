import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position, SignatureHelp, SignatureInformation, ParameterInformation } from 'vscode-languageserver/node';
import { EdgeParser } from '../server/parser';

// Define signature information for Edge helpers and functions
const SIGNATURES: SignatureInformation[] = [
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
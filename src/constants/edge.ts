/**
 * Constants for Edge language constructs
 */

// Edge directives
export const DIRECTIVES = [
  // Conditional directives
  'if',
  'elseif',
  'else',
  'unless',
  'endif',
  'endunless',
  
  // Loop directives
  'each',
  'forelse',
  'endforeach',
  
  // Component and template directives
  'component',
  '!component',
  'endcomponent',
  'slot',
  'endslot',
  'inject',
  'include',
  'includeIf',
  
  // Utility directives
  'eval',
  'newError',
  'svg',
  'debugger',
  'let',
  'assign',
  'vite',
  
  // Other directives
  'section',
  'endsection',
  'yield',
  'extends',
  'block',
  'endblock',
  'hasBlock',
  'for',
  'endfor',
  'while',
  'endwhile',
  'break',
  'continue',
  'super',
  'debug',
  'endphp',
  'verbatim',
  'endverbatim'
];

// Edge global helpers
export const GLOBAL_HELPERS = [
  // Props helpers
  'toAttrs',
  'merge',
  'only',
  'except',
  
  // Slots helpers
  'slots',
  
  // Debug helpers
  'filename',
  'caller',
  
  // Text processing helpers
  'nl2br',
  'truncate',
  'excerpt',
  
  // HTML helpers
  'escape',
  'safe',
  'classNames',
  'attrs',
  
  // String helpers
  'camelCase',
  'snakeCase',
  'dashCase',
  'pascalCase',
  'titleCase',
  'capitalCase',
  
  // Number/time helpers
  'prettyMs',
  'toBytes',
  'ordinal',
  
  // Original helpers
  'asset',
  'route',
  'url',
  'csrfField',
  'csrfToken',
  'request',
  'auth',
  'session',
  'flash',
  'old',
  'errors',
  'config',
  'env',
  'app',
  'view',
  'response',
  'redirect',
  'abort',
  'cache',
  'date',
  'inspect',
  'paginator',
  'cspNonce'
];

// Edge filters
export const FILTERS = [
  'ucfirst',
  'lcfirst',
  'ucwords',
  'upper',
  'lower',
  'title',
  'capitalize',
  'escape',
  'e',
  'json',
  'safe',
  'link',
  'mailto',
  'highlight',
  'highlightSafe',
  'nl2br',
  'pluralize',
  'truncate',
  'timeAgo',
  'currency',
  'md5',
  'sha1',
  'slug',
  'numberFormat',
  'size',
  'base64',
  'camelCase',
  'snakeCase',
  'dashCase',
  'pascalCase'
];

// Loop properties
export const LOOP_PROPERTIES = [
  'index',
  'index0',
  'revindex',
  'revindex0',
  'first',
  'last',
  'length',
  'depth',
  'parent'
];

// AdonisJS specific helpers
export const ADONISJS_HELPERS = [
  'signedRoute',
  't' // Internationalization helper
];

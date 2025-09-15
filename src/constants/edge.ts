/**
 * Constants for Edge language constructs
 */

// Edge directives
export const DIRECTIVES = [
  'if',
  'else',
  'elseif',
  'endif',
  'each',
  'forelse',
  'endforeach',
  'for',
  'endfor',
  'while',
  'endwhile',
  'unless',
  'endunless',
  'section',
  'endsection',
  'yield',
  'include',
  'component',
  'endcomponent',
  'slot',
  'endslot',
  'debug',
  'endphp',
  'verbatim',
  'endverbatim',
  'inject',
  'break',
  'continue'
];

// Edge global helpers
export const GLOBAL_HELPERS = [
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
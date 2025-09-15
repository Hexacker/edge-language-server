# Edge Language Server

This is a language server for the [Edge](https://edge.adonisjs.com/) templating engine, used by the [AdonisJS](https://adonisjs.com/) framework.

## Features

* **Completions**: Provides completions for directives, helpers, and variables.
* **Hover**: Provides hover information for directives and interpolations.
* **Definitions**: Provides definitions for `@include` and `@component` directives.
* **Validation**: Validates the syntax of Edge templates.

## Installation

```bash
npm install
```

## Usage

```bash
npm run build
npm run start
```

## Development

```bash
npm run dev
```

## Tree-sitter Parser

This language server uses a tree-sitter parser for Edge templates. The parser is available as a separate npm package called `tree-sitter-edge`. 

The language server will automatically use the published `tree-sitter-edge` npm package if it's available in your dependencies. If not, it will fall back to using a local WASM file.

To use the published npm package, simply add it to your dependencies:

```bash
npm install tree-sitter-edge
```

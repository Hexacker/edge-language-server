module.exports = grammar({
  name: 'edge',

  rules: {
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.directive,
      $.text
    ),

    directive: $ => choice(
      $.if_directive
    ),

    if_directive: $ => seq(
      '@if',
      '(',
      $.expression,
      ')',
      repeat($._statement),
      '@endif'
    ),

    expression: $ => /[^)]+/,

    text: $ => /[^@]+/
  }
});

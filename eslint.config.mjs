import tseslint from 'typescript-eslint';
import parser from '@typescript-eslint/parser';

export default tseslint.config({
  files: ['src/**/*.ts'],
  languageOptions: {
    parser: parser,
  },
  rules: {
    semi: 'error',
  },
});

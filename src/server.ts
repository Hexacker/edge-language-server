import { EdgeLanguageServer } from './server/server';

async function main() {
  try {
    const server = new EdgeLanguageServer();
    server.listen();
  } catch (error) {
    console.error('Failed to start language server:', error);
  }
}

main().catch(error => {
  console.error('Failed to start language server:', error);
});

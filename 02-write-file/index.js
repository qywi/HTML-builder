const { error } = require('console');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const outputPath = path.join(__dirname, 'output.txt');

const writeStream = fs.createWriteStream(outputPath, { flags: 'a' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('Welcome! Enter your text (type "exit" to quit):');

rl.on('line', (input) => {
  if (input.trim().toLowerCase() === 'exit') {
    console.log('Goodbye! Thanks for using the app!');
    rl.close();
    writeStream.end();
    process.exit(0);
  }

  writeStream.write(input + '\n', (error) => {
    if (error) {
      console.error('Error writing to file:', err);
      return;
    }
  });
});

process.on('SIGINT', () => {
  console.log('\nGoodbye! Thanks for using the app!');
  rl.close();
  writeStream.end();
  process.exit(0);
});

writeStream.on('error', (error) => {
  console.error('Error with the write stream:', error);
  rl.close();
  process.exit(1);
});

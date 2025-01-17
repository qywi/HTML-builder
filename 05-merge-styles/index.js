const fs = require('fs/promises');
const path = require('path');

async function mergeStyles() {
  const stylesDir = path.join(__dirname, 'styles');
  const outputDir = path.join(__dirname, 'project-dist');
  const outputFile = path.join(outputDir, 'bundle.css');

  try {
    await fs.mkdir(outputDir, { recursive: true });
    const files = await fs.readdir(stylesDir, { withFileTypes: true });

    const cssFiles = files.filter(
      (file) => file.isFile() && path.extname(file.name) === '.css',
    );

    const stylesPromises = cssFiles.map(async (file) => {
      const filePath = path.join(stylesDir, file.name);
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    });

    const styles = await Promise.all(stylesPromises);

    const bundleContent = styles.join('\n\n');

    await fs.writeFile(outputFile, bundleContent, 'utf-8');

    console.log('CSS bundle successfully created!');
  } catch (error) {
    console.error('Error creating CSS bundle:', error.message);
  }
}

mergeStyles();

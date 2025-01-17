const { readdir } = require('fs');
const fs = require('fs/promises');
const path = require('path');

async function copyDir() {
  const sourceDir = path.join(__dirname, 'files');
  const targetDir = path.join(__dirname, 'files-copy');

  try {
    await fs.mkdir(targetDir, { recursive: true });

    const existingFiles = await fs.readdir(targetDir);
    for (const file of existingFiles) {
      await fs.unlink(path.join(targetDir, file));
    }

    const files = await fs.readdir(sourceDir);

    const copyPromises = files.map((file) => {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      return fs.copyFile(sourcePath, targetPath);
    });

    await Promise.all(copyPromises);

    console.log('Directory copying completed successfully!');
  } catch (error) {
    console.error('Error copying directory:', error.message);
  }
}

copyDir();

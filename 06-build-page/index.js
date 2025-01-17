const fs = require('fs/promises');
const path = require('path');

class PageBuilder {
  constructor() {
    this.rootDir = __dirname;
    this.distDir = path.join(this.rootDir, 'project-dist');
    this.componentsDir = path.join(this.rootDir, 'components');
    this.stylesDir = path.join(this.rootDir, 'styles');
    this.assetsDir = path.join(this.rootDir, 'assets');
  }

  async build() {
    try {
      await fs.mkdir(this.distDir, { recursive: true });

      await Promise.all([
        this.buildHtml(),
        this.buildStyles(),
        this.copyAssets(),
      ]);

      console.log('Page assembly completed successfully!');
    } catch (error) {
      console.error('Error while assembling page:', error.message);
    }
  }

  async buildHtml() {
    try {
      const templatePath = path.join(this.rootDir, 'template.html');
      let template = await fs.readFile(templatePath, 'utf-8');

      const componentTags = template.match(/{{[^{}]+}}/g) || [];
      const uniqueTags = [...new Set(componentTags)];

      for (const tag of uniqueTags) {
        const componentName = tag.slice(2, -2).trim();
        const componentPath = path.join(
          this.componentsDir,
          `${componentName}.html`,
        );

        try {
          const componentContent = await fs.readFile(componentPath, 'utf-8');
          template = template.replaceAll(tag, componentContent);
        } catch (error) {
          console.warn(
            `Component ${componentName} not found or is not an HTML file`,
          );
        }
      }

      await fs.writeFile(
        path.join(this.distDir, 'index.html'),
        template,
        'utf-8',
      );
    } catch (error) {
      throw new Error(`Error while building HTML: ${error.message}`);
    }
  }

  async buildStyles() {
    try {
      const files = await fs.readdir(this.stylesDir, { withFileTypes: true });

      const cssFiles = files.filter(
        (file) => file.isFile() && path.extname(file.name) === '.css',
      );

      const styles = await Promise.all(
        cssFiles.map(async (file) => {
          const filePath = path.join(this.stylesDir, file.name);
          return await fs.readFile(filePath, 'utf-8');
        }),
      );

      const bundle = styles.join('\n\n');

      await fs.writeFile(path.join(this.distDir, 'style.css'), bundle, 'utf-8');
    } catch (error) {
      throw new Error(`Error while compiling styles: ${error.message}`);
    }
  }

  async copyAssets() {
    try {
      const targetDir = path.join(this.distDir, 'assets');

      await fs.mkdir(targetDir, { recursive: true });

      await this.copyDirRecursive(this.assetsDir, targetDir);
    } catch (error) {
      throw new Error(`Error copying assets: ${error.message}`);
    }
  }

  async copyDirRecursive(src, dest) {
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true });
        await this.copyDirRecursive(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
}

const builder = new PageBuilder();
builder.build();

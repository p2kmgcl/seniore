import { readdirSync, statSync } from 'fs';
import { resolve, sep } from 'path';

export const ModuleService = {
  getModulePath(initialPath = resolve('.')): string | null {
    if (statSync(initialPath).isDirectory()) {
      const children = readdirSync(initialPath);

      if (children.includes('build.gradle')) {
        return initialPath;
      }
    }

    const parent = initialPath.split(sep).slice(0, -1).join(sep);

    if (parent && parent !== initialPath) {
      return ModuleService.getModulePath(parent);
    }

    return '';
  },

  getGradlewPath(initialPath = resolve('.')): string | null {
    if (statSync(initialPath).isDirectory()) {
      const children = readdirSync(initialPath);

      if (children.includes('gradlew')) {
        return `${initialPath}${sep}gradlew`;
      }
    }

    const parent = initialPath.split(sep).slice(0, -1).join(sep);

    if (parent && parent !== initialPath) {
      return ModuleService.getGradlewPath(parent);
    }

    return null;
  },
};

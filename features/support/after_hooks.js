import path from 'path';
import { After } from 'cucumber';
import rimraf from 'rimraf';

After(function () {
  // Clean Up After Every Scenario:
  const { cacheDir, __skipCacheCleanUp__ } = this.options;
  if (!__skipCacheCleanUp__ && cacheDir && cacheDir !== './') {
    const cwd = process.cwd();
    rimraf.sync(path.join(cwd, cacheDir), { disableGlob: true });
  }

  if (this.proxy) {
    this.proxy.shutdown();
    this.proxy = null;
  }
  this.options = null;
  this.error = null;
});

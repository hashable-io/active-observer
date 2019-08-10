import { directoryExists, findFileType }from '../../src/cache/disk';
import { setWorldConstructor } from 'cucumber';
import path from 'path';

function World () {
  const cwd = process.cwd();

  this.cacheFiles = function (cacheDir, endpoint) {
    const isFile = filePath => !directoryExists(filePath); 
    const targetPath = path.join(cwd, cacheDir, endpoint.toLowerCase()) 
    return findFileType(targetPath, isFile);
  };

  this.logFile = function (cacheDir, logFile) {
    const isFile = filePath => filePath.indexOf(logFile) > -1; 
    const targetPath = path.join(cwd, cacheDir)
    return findFileType(targetPath, isFile);
  };
}

setWorldConstructor(World);

import fs from "fs";
import path from "path";

import R from "ramda";
import rebote from "rebote";

import * as hashUtils from "../utils/hash";
import * as headerUtils from "../utils/headers";
import * as utils from "../utils";
import { parseJson } from "../utils/json";

const EXT = '.cache';
const TRAILING_NEW_LINE = '\n';

export function isCached(request, options) {
  return R.any(fileExists, [
    requestPathOverride(request, options),
    requestPath(request, options)
  ]);
}

export function record(request, response, options) {
  return new Promise((resolve, reject) => {
    response.options = options;
		console.log("????", request.headers)
    response.request.headers = headerUtils.filterHeaders(request, options);
    response.request.path = headerUtils.filterQueryParameters(request, options);
    response.response.headers = headerUtils.removeHeaders(response.response, options);

    let responseString = JSON.stringify(response) + TRAILING_NEW_LINE;

    let writeToFile = () => {
      let targetFile = getWriteFileName(request, options);
      writeToAccessFile(targetFile, options);
      fs.writeFile(targetFile, responseString, (err) => {
        if (err) { return reject(err); }
        resolve(true);
      });
    };

    let directoryName = directory(request, options.overrideCacheDir || options.cacheDir);
    if (!directoryExists(directoryName)) {
      return createDirectory(directoryName).then(writeToFile);
    }

    writeToFile();
  });
}

export function read(request, options) {
  return new Promise((resolve, reject) => {
    const filePath = getReadFileName(request, options);
    writeToAccessFile(filePath, options);
    fs.readFile(filePath, (err, fileContents) => {
      if (err) { return reject(err); }
      const onError = R.thunkify(resolve)(fileContents);
      const onSuccess = resolve;
      return parseJson(fileContents).fold(onError, onSuccess);
    });
  });
}

export function findFileType(root, predicate) {
  const formattedRoot = formatRootPath(root);
  try {
    const findFileTypes = R.compose(
      R.filter((file) => file != '.' && file != '..'),
      R.map((file)  => formattedRoot + file),
      R.filter(predicate)
    );
    return R.transduce(findFileTypes, R.flip(R.append), [], fs.readdirSync(formattedRoot));
  } catch (error) {
    return []; // No Matches
  }
}
export function findDirectories(root) {
  return R.transduce(R.map(findDirectories), R.flip(R.append), [root], findFileType(root, directoryExists));
};

export const directoryExists = R.tryCatch(isDirectory, R.F);

///////////////////////////////////////////////////////////////////////////////
// Helper Functions:
///////////////////////////////////////////////////////////////////////////////
  
const formatRootPath = (root) => root.lastIndexOf('/') != root.length - 1 ? root + '/' : root;

function isDirectory(path) { 
  return fs.statSync(path).isDirectory();
}

function createDirectory(directoryPath) {
  return new Promise((resolve, reject) => {
    createDirectoryParent(directoryPath, (error) => {
      if (error) {
        return reject('Failed to Create Directory: ' + directoryPath);
      }
      resolve();
    });
  });
};

function createDirectoryParent(directoryPath, callback) {
  fs.mkdir(directoryPath, (error) => {
    if (error && error.code === 'ENOENT') {
      let parentDirectory = path.dirname(directoryPath);
      let createCurrentDirectoryCallback = createDirectoryParent.bind(null, directoryPath, callback);
      return createDirectoryParent(parentDirectory, createCurrentDirectoryCallback);
    }

    return callback(error);
  });
}

function fileExists(location) {
  try {
    const RW_MODE = fs.F_OK | fs.R_OK | fs.W_OK;
    fs.accessSync(location, RW_MODE);
    return true;
  } catch (error) {
    rebote.rethrow(error);
    return false;
  }
}

function requestPath(request, options) {
  let hash = requestHash(request, options);
  let directoryName = directory(request, options.cacheDir);

  return path.join(directoryName, hash) + EXT;
}

function requestPathOverride(request, options) {
  let hash = requestHash(request, options);
  let directoryName = directory(request, options.overrideCacheDir || '');

  return path.join(directoryName, hash) + EXT;
}

function replaceQueryParam(directoryName) {
  let queryParamStartIndex = directoryName.indexOf('?');

  if (queryParamStartIndex == -1) {
    return directoryName;
  }

  return directoryName.substr(0, queryParamStartIndex);
}

function directory(request, rootDir) {
  let requestPath = request.path || '';
  let pathEndsSlash = requestPath.lastIndexOf('/') == path.length - 1;
  requestPath = pathEndsSlash ? requestPath.substr(0, requestPath.length - 1) : requestPath;
  requestPath = requestPath.split('/').map(replaceQueryParam).join('/').toLowerCase();

  return path.join(rootDir, requestPath);
}

function requestHash(request, options) {
  return hashUtils.requestHash(request, options)
    .toString()
    .substr(0,10);
}

function getReadFileName(request, options) {
  const overridePath = R.find(fileExists, [requestPathOverride(request, options)]);
  const baseRequestPath = requestPath(request, options);
  return R.defaultTo(baseRequestPath, overridePath)
}

function getWriteFileName(request, options) {
  if (options.overrideCacheDir) {
    return requestPathOverride(request, options);
  }
  return requestPath(request, options);
}

function writeToAccessFile(filePath, options) {
  if (options.accessLogFile) {
    fs.appendFile(options.accessLogFile, filePath + '\n', (err) => {
      if (err) throw err;
    });
  }
};

#!/usr/bin/env node

const fs = require('fs');
const process = require('process');
const path = require('path');
const child_process = require('child_process');

/**
 * Return a tuple representing the args before for node, the binary name, and
 * the args for the binary.
 */
function splitArguments(args) {
  const result = args.reduce(
    (accumulator, arg) => {
      const alreadyFoundBinary = accumulator.length > 1;

      if (alreadyFoundBinary) {
        accumulator[2].push(arg);
      } else {
        // Does this binary exist in node_modules
        const targetPath = path.join('node_modules', '.bin', arg);

        if (fs.existsSync(targetPath)) {
          // This is the binary
          accumulator.push(arg, []);
        } else {
          accumulator[0].push(arg);
        }
      }

      return accumulator;
    },
    [[]]
  );

  if (result.length === 1) {
    throw new Error('Could not find binary');
  }

  return result;
}

function readPNPMBinaryScript(binaryName) {
  const localBinaryPath = path.join('node_modules', '.bin', binaryName);
  return fs.readFileSync(localBinaryPath, 'utf-8');
}

function getAbsoluteBinaryPath(binaryName) {
  const contents = readPNPMBinaryScript(binaryName);
  const relativePathBinary = contents
    .match(/exec\s*node\s*"([^"]+)"/)?.[1]
    ?.replace('$basedir/', '');
  const absolutePathBinary = path.resolve(
    path.join('.', 'node_modules', '.bin'),
    relativePathBinary
  );

  return absolutePathBinary;
}

function getNodePathEnv(binaryName) {
  const contents = readPNPMBinaryScript(binaryName);
  const nodePathEnv = contents.match(/export\s*NODE_PATH="([^"]+)"/)?.[1];

  if (!nodePathEnv) throw new Error('could not find node path');

  return nodePathEnv;
}

if (process.argv.length === 2) {
  console.log('USAGE: pnpm-bin [node args] binaryName [binary args]')
  process.exit(0);
}

const [nodeArgs, binaryName, binaryArgs] = splitArguments(
  process.argv.slice(2)
);

// Magic arguments
if (binaryName === 'jest') {
  binaryArgs.push('--color');
}


child_process.spawn(
  process.argv[0],
  [...nodeArgs, getAbsoluteBinaryPath(binaryName), ...binaryArgs],
  {
    env: {
      NODE_PATH: `${
        process.env.NODE_PATH ? `${process.env.NODE_PATH}:` : ''
      }${getNodePathEnv(binaryName)}`
    },
    stdio: ['inherit', 'inherit', 'inherit']
  }
);

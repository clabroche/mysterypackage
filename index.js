#!/bin/env node
if (process.argv.length < 3) {
  throw new Error('Specify a path')
}

const pathfs = require('path')
const fse = require('fs-extra')
const asar = require('asar')
;(async _ => {
  const srcPath = pathfs.resolve(process.argv.pop())
  const srcAsarPathFile = pathfs.resolve(srcPath, 'resources', 'app.asar')
  const srcAsarUnpackFile = pathfs.resolve(srcPath, 'resources', 'app.asar.unpacked')
  const destAsarPathUnpackDirectory = pathfs.resolve(__dirname, 'asar_unpack')
  const destAsarUnpackFile = pathfs.resolve(__dirname, 'app.asar.unpacked')
  const destAsarFilePack = pathfs.resolve(__dirname, 'app.asar')
  const pathExist = await fse.exists(srcAsarPathFile)
  if (!pathExist) { throw new Error('Path seems to be wrong') }
  await fse.remove(destAsarPathUnpackDirectory)
  await fse.remove(destAsarUnpackFile)
  await fse.remove(destAsarFilePack)
  await fse.mkdirp(destAsarPathUnpackDirectory)
  await fse.copy(srcAsarPathFile, destAsarFilePack)
  await fse.copy(srcAsarUnpackFile, destAsarUnpackFile)
  await asar.extractAll(destAsarFilePack, destAsarPathUnpackDirectory)
  const utilsPath = pathfs.resolve(destAsarPathUnpackDirectory, 'frontend' ,'utils', 'index.js')
  let utils = await fse.readFile(utilsPath, 'utf-8')
  utils = utils.replace(/noLicAndTrialExpires.*\}\}/, 'noLicAndTrialExpires: false}}')
  await fse.writeFile(utilsPath, utils, 'utf-8')
  await asar.createPackage(destAsarPathUnpackDirectory, destAsarFilePack)
  await fse.copy(destAsarFilePack, srcAsarPathFile)
})().catch(console.error)
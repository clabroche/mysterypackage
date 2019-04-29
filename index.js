#!/bin/env node
if (process.argv.length < 3) {
  throw new Error('Specify a path')
}

const pathfs = require('path')
const fse = require('fs-extra')
const asar = require('asar')
;(async _ => {
  const path = pathfs.resolve(process.argv.pop())
  const unpackPath = pathfs.resolve(path, 'resources', 'app.asar.unpacked')
  const asarPath = pathfs.resolve(path, 'resources', 'app.asar')
  const asarPathUnpack = pathfs.resolve(__dirname, 'asar_unpack')
  const asarFilePack = pathfs.resolve(__dirname, 'app.asar')
  const asarUnpackDirPack = pathfs.resolve(__dirname, 'app.asar.unpacked')
  const pathExist = await fse.exists(asarPath)
  if (!pathExist) { throw new Error('Path seems to be wrong') }
  await fse.remove(asarPathUnpack)
  await fse.mkdirp(asarPathUnpack)
  await fse.copy(asarPath, asarFilePack)
  await fse.copy(unpackPath, asarUnpackDirPack)
  await asar.extractAll(asarFilePack, asarPathUnpack)
  const utilsPath = pathfs.resolve(asarPathUnpack, 'frontend' ,'utils', 'index.js')
  let utils = await fse.readFile(utilsPath, 'utf-8')
  utils = utils.replace(/noLicAndTrialExpires.*\}\}/, 'noLicAndTrialExpires: false}}')
  await fse.writeFile(utilsPath, utils, 'utf-8')
  await asar.createPackage(asarPathUnpack, asarFilePack)
  await fse.copy(asarFilePack, asarPath)
})().catch(console.error)
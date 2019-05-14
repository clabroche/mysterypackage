#!/bin/env node
if (process.argv.length < 3) {
  throw new Error('Specify a path')
}

const pathfs = require('path')
const fse = require('fs-extra')
const asar = require('asar')
const Promise = require('bluebird')

const srcPath = pathfs.resolve(process.argv.pop())
const srcAsarPathFile = pathfs.resolve(srcPath, 'resources', 'app.asar')
const srcAsarUnpackFile = pathfs.resolve(srcPath, 'resources', 'app.asar.unpacked')
const destAsarPathUnpackDirectory = pathfs.resolve(__dirname, 'asar_unpack')
const destAsarUnpackFile = pathfs.resolve(__dirname, 'app.asar.unpacked')
const destAsarFilePack = pathfs.resolve(__dirname, 'app.asar')

;(async _ => {
  const pathExist = await fse.exists(srcAsarPathFile)
  if (!pathExist) { throw new Error('Path seems to be wrong') }
  await prepareWorkspace()
  await copyAndExtract()
  await replace()
  await repack()
  await cleanWorkspace(destAsarPathUnpackDirectory, destAsarUnpackFile, destAsarFilePack)
})().catch(console.error)

async function repack() {
  await asar.createPackage(destAsarPathUnpackDirectory, destAsarFilePack)
  await fse.copy(destAsarFilePack, srcAsarPathFile)
}
async function replace() {
  const utilsPath = pathfs.resolve(destAsarPathUnpackDirectory, mystery([10,9,24,17,12,6,17,7]) ,mystery([18,12,21,25,4]), mystery([21,17,7,6,5,81,19,4]))
  let utils = await fse.readFile(utilsPath, 'utf-8')
  utils = utils.replace(/noLicAndTrialExpires.*\}\}/, mystery([17,24,83,21,8,57,17,7,70,9,21,0,25,63,5,27,21,9,6,4,26,66,10,0,25,4,6,93,93]))
  await fse.writeFile(utilsPath, utils, 'utf-8')
  
  const utilsPath2 = pathfs.resolve(destAsarPathUnpackDirectory, mystery([10,9,24,17,12,6,17,7]), mystery([4,8,9,21,27,12,6,9]), mystery([7,0,12,0,69,21,6,2,6,9]), mystery([64,24,8,65,24,17,12,6,5,12,86,6,17,18,79,28,27,25,81,19,4]))
  let utils2 = await fse.readFile(utilsPath2, 'utf-8')
  utils2 = utils2.replace(mystery([18,12,21,25,4,39,45,81,8,12,46,36,42,81,25,21,8,6,17,4,6,7]), mystery([12,9,18,6]))
  await fse.writeFile(utilsPath2, utils2, 'utf-8')

  
  const utilsPath3 = pathfs.resolve(destAsarPathUnpackDirectory, mystery([10,9,24,17,12,6,17,7]), mystery([18,12,21,25,4]), mystery([21,17,7,6,5,81,19,4]))
  let utils3 = await fse.readFile(utilsPath3, 'utf-8')
  utils3 = utils3.replace(mystery([9,6,12,18,9,17,66,8,16,6,8,22,83,21,8,6,17,4,6,7,36,42]), mystery([9,6,12,18,9,17,66,12,9,18,6]))
  await fse.writeFile(utilsPath3, utils3, 'utf-8')
}
async function prepareWorkspace() {
  await cleanWorkspace(destAsarPathUnpackDirectory, destAsarUnpackFile, destAsarFilePack)
  await fse.mkdirp(destAsarPathUnpackDirectory)
}

async function copyAndExtract() {
  await fse.copy(srcAsarPathFile, destAsarFilePack)
  await fse.copy(srcAsarUnpackFile, destAsarUnpackFile)
  await asar.extractAll(destAsarFilePack, destAsarPathUnpackDirectory)
}
async function cleanWorkspace(...paths) {
  return Promise.map(paths, async path => {
    await fse.remove(path)
  })
}


const mystery = function(i) {
  return i.map((v) =>'aqwzsxedcrfvtgbyhnuj,ik;ol:pm!$*²&é"(-è_çà)=~1234567890°+AQWZSXEDC RFVTGBYHNUJ?IK.OL/PM§£µ¨%^}'[v]).join('')
}
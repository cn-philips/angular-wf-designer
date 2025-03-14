const { execSync, exec } = require('child_process')
const fs = require('fs')
// var arguments = process.argv;
const packageJsonStr = fs.readFileSync('./package.json').toString()
const packageJson = JSON.parse(packageJsonStr)
exec(`git symbolic-ref --short -q HEAD`, async (err, stdout, stderr) => {
  // 在生产分支上才打tag
  if (stdout.trim() === 'prod-v3') {
    let newTag = `Release-${packageJson.version}`;
    let remoteLatestTag = await getRemoteLatestTag()
    if (newTag !== remoteLatestTag) {
      console.log(`更新Tag:${newTag}`)
      if (!await hasTag(newTag)) {
        remoteLatestTag = newTag
        execSync(`git tag ${newTag} && git push origin ${newTag}`)
      } else {
        console.log(`远端存在Tag:${remoteLatestTag}，本次构建不打Tag，若需要更新，请更新Package.json版本号`)
      }
    }
    console.log(`正在打包，Tag为:${remoteLatestTag}`)
  }
})

function getRemoteLatestTag () {
  return new Promise((res, rej) => {
    exec(`git describe origin`, (err, stdout, stderr) => {
      let strArr = stdout.split('-')
      // 移除末两位提交和git hash
      strArr = strArr.splice(0, strArr.length - 2)
      res(strArr.join('-'))
    })
  })
}

function hasTag (tagName) {
  return new Promise((res, rej) => {
    exec(`git ls-remote --tags origin`, (err, stdout, stderr) => {
      res(stdout.indexOf(tagName) >= 0)
    })
  })
}

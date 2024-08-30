const { execSync, exec } = require('child_process')
const fs = require('fs')
const packageJsonStr = fs.readFileSync('./package.json').toString()
const packageJson = JSON.parse(packageJsonStr)

exec(`git status`, async (err, stdout, stderr) => {
  if (stdout.indexOf('package.json') < 0 && await hasPushedLastVersion()) {
    try {
      // 升级版本号
      const arr = packageJson.version.split('.')
      if (arr[2] < 99) {
        arr[2] = ((arr[2] / 100 + 0.01)*100).toFixed()
        if(arr[2].toString().length==1){
          arr[2]="0"+arr[2]
        }
      } else if (arr[1] < 9) {
        arr[1] = +arr[1] + 1
        arr[2] = 0
      } else {
        arr[0] = +arr[0] + 1
        arr[1] = 0
        arr[2] = 0
      }
      const newVersion = arr.join('.')
      packageJson.version = newVersion
      fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, '\t'))
      console.log(`------------ 更新版本号：${packageJson.version} ------------`);
      // add new package.json
      execSync(`git add package.json && git commit -m "[Auto-Update-Version] 更新版本号 (V${packageJson.version})"`)
    } catch (e) {
      console.error('处理package.json失败，请重试', e.message);
      process.exit(1)
    }
  } else {
    console.log(`------------ 当前版本号：V${packageJson.version}（未更新） ------------`);
  }
  console.log(`------------ 开始构建 ------------`);
})

function hasPushedLastVersion(){
  return new Promise((res,rej)=>{
    exec(`git cherry -v`, (err, stdout, stderr) => {
      res(stdout.indexOf('[Auto-Update-Version]') < 0)
      // res(true)
      // console.log(stdout, stdout.indexOf('[Auto-Update-Version]') < 0)
      // res(false)
    })
  })
}

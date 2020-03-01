const { rmDirDep, rmDirDepSync, rmDirBre, rmDirBreSync } = require('./rmdirs');
const fs = require('fs');

function createFolder() {
    fs.mkdirSync('./testFolder');
    fs.writeFileSync('./testFolder/a.js', 'a.js')
    fs.mkdirSync('./testFolder/b')
    fs.mkdirSync('./testFolder/b/c')
    fs.writeFileSync('./testFolder/b/d.js', 'd.js')
}

// createFolder();

console.log('开始测试异步深度遍历了');
rmDirDep('./testFolder', function () {
    console.log("删除完成");
})

// console.log('开始测试同步深度遍历了');
// rmDirDepSync('./testFolder')
// console.log("删除完成");

// console.log('开始测试异步广度遍历了');
// rmDirBre('./testFolder',function(){
//     console.log("删除完成");
// })

// console.log('开始测试同步广度遍历了');
// rmDirBreSync('./testFolder')
// console.log("删除完成");

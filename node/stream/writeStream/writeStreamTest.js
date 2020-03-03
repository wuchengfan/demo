const fs = require('fs');
const WriteStream = require('./writeStream');

let ws = new WriteStream('./1.txt', {
    flags: 'w',
    mode: 0o666,
    start: 0,
    highWaterMark: 3,
    autoClose: true
});

ws.on('open', () => {
    console.log('文件打开了');
})

ws.on('close', () => {
    console.log('关闭了')
})

ws.on('drain', () => {
    console.log('缓冲区排空了');
    write();
})

let i = 9;
function write() {
    let flag = true;
    while (i > 0 && flag) {
        flag = ws.write(--i + '', 'utf8', () => {
            console.log('ok')
        });
        console.log(flag)
    }
}
write();
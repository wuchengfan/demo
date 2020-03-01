const fs = require('fs');

const rs = fs.createReadStream('./1.txt', {
    highWaterMark: 8
});
const ws = fs.createWriteStream('./2.txt', {
    highWaterMark: 8
});

rs.on('data', chunk => {
    if (ws.write(chunk) === false) {
        rs.push();
    }
})

// 当待处理队列小于 highWaterMark 时触发 drain 事件
ws.on('drain', () => {
    console.log('dragin');
    rs.resume();
})

// 相当于下面
// rs.pipe(ws)
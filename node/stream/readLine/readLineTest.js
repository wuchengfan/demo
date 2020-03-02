const ReadLine = require('./readLine');

let readLine = new ReadLine('./1.txt');

readLine.on('readLine', ret => {
    console.log(ret.toString());
})
const copy = require('./copy');

copy('./copyTest.txt', 'copyTestTarget.txt', function () {
    console.log('输出成功！');
})
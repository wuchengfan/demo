const { open, read, write } = require('fs');
const WRITE_LENGTH = 8;

/**
 * 复制文件
 * @param {String} url 要复制文件的路径 
 * @param {String} target 复制目标的路径
 * @param {Fuction} callback 回调函数
 */
function copy(url, target, callback) {
    open(url, 'r', function (err1, readFd) {
        open(target, 'w', function (err2, writeFd) {
            let buf = Buffer.alloc(WRITE_LENGTH);
            !function _copy() {
                read(readFd, buf, 0, WRITE_LENGTH, null, function (err3, bytesRead, buffer) {
                    if (bytesRead > 0) {
                        write(writeFd, buf, 0, bytesRead, null, _copy)
                    } else {
                        callback();
                    }
                })
            }()
        })
    })
}

module.exports = copy;
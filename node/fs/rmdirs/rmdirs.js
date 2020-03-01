
const fs = require('fs');
const { join } = require('path');

/**
 * 异步深度优先删除非空目录
 * @param {String} dirPath 路径 
 * @param {Function} callback 回调函数 
 */
function rmDirDep(dirPath, callback) {
    fs.stat(dirPath, (err, stats) => {
        if (stats.isDirectory()) {
            fs.readdir(dirPath, (err2, files) => {
                !function next(index) {
                    if (files.length === index) {
                        return fs.rmdir(dirPath, callback);
                    }
                    rmDirDep(join(dirPath, files[index]), () => next(index + 1))
                }(0)
            })
        } else if (stats.isFile()) {
            fs.unlink(dirPath, callback)
        }
    })
}

/**
 * 同步深度优先删除非空目录
 * @param {String} dirPath 路径 
 */
function rmDirDepSync(dirPath) {
    let stats = fs.statSync(dirPath);
    if (stats.isDirectory()) {
        let files = fs.readdirSync(dirPath);
        files.forEach(file => {
            rmDirDepSync(join(dirPath, file))
        })
        // 删除完所有子节点后，删除自己
        fs.rmdirSync(dirPath)

    } else if (stats.isFile()) {
        fs.unlinkSync(dirPath)
    }
}

/** */
function rmDirBre(dirPath, callback) {
    let pathArr = [];
    let queue = [dirPath]

    !function next() {
        if (queue.length === 0) {
            return remove();
        }
        let dirItem = queue.shift();
        pathArr.push(dirItem);

        fs.stat(dirItem, (err, stats) => {
            if (stats.isDirectory()) {

                fs.readdir(dirItem, (err2, files) => {
                    files.forEach(file => {
                        queue.push(join(dirItem, file));
                    });
                    next();
                })
            } else if (stats.isFile()) {
                next()
            }
        })
    }()

    function remove() {
        !function next(index) {
            if (index < 0) return callback();
            let current = pathArr[index];
            fs.stat(current, (err, statObj) => {
                if (statObj.isDirectory()) {
                    fs.rmdir(current, () => next(index - 1));
                } else {
                    fs.unlink(current, () => next(index - 1));
                }
            });
        }(pathArr.length - 1)
    }
}

/**
 * 同步广度优先删除非空目录
 * @param {String} dirPath 路径
 */
function rmDirBreSync(dirPath) {
    let pathArr = []
    let queue = [dirPath];

    while (queue.length !== 0) {
        let dirItem = queue.shift();
        pathArr.push(dirItem)

        let stats = fs.statSync(dirItem);
        if (stats.isDirectory()) {
            let files = fs.readdirSync(dirItem);
            files.forEach(file => {
                queue.push(join(dirItem, file));
            })
        }
    }
    // 倒叙循环删除
    for (let i = pathArr.length - 1; i >= 0; i--) {
        let pathItem = pathArr[i];
        let statObj = fs.statSync(pathItem);

        if (statObj.isDirectory()) {
            fs.rmdirSync(pathItem);
        } else {
            fs.unlinkSync(pathItem);
        }
    }
}

module.exports = {
    rmDirDep,
    rmDirDepSync,
    rmDirBre,
    rmDirBreSync
} 
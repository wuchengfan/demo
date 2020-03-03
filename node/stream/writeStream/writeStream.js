const EventEmmiter = require('events');
const fs = require('fs');

class WriteStream extends EventEmmiter {
    constructor(path, options) {
        super()
        this.path = path;
        this.mode = options.mode;
        this.flags = options.flags || 'w';
        this.start = options.start || 0;
        this.highWaterMark = options.hightWaterMark || 16 * 1024;
        this.autoClose = options.autoClose;
        this.encoding = options.encoding || 'utf8';
        // 记录写入的位置
        this._pos = 0;
        // 记录缓存区的大小
        this._length = 0;
        // 记录是否正在写入
        this._writing = false;
        // 可写流 要有一个缓存区，当正在写入文件是，内容要写入到缓存区中
        // 源码中是Buffer链表
        this.buffers = [];

        this._needDragin = false;

        this.open();
    }

    open() {
        fs.open(this.path, this.flags, this.mode, (err,fd) => {
            if (err) {
                return this._errorHander(err);
            }
            this.fd = fd;
            this.emit('open');
        })
    }

    write(chunk, encoding = this.encoding, callback = () => { }) {
        chunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding);
        this._length += chunk.length;
        // 比较是否达到了缓存区的大小
        let ret = this._length < this.highWaterMark;
        // 是否需要触发needDrain
        this._needDragin = !ret;

        //  判断是否正在写入 如果是正在写入 就写入到缓存区中
        if (this._writing) {
            this.buffers.push({
                encoding,
                chunk,
                callback
            });

        } else {
            this._writing = true;
            this._write(chunk, encoding, () => {
                callback();
                this.clearBuffer();
            });
        }

        return ret;
    }
    // 底层用来写数据的
    _write(chunk, encoding, callback) {
        if (typeof this.fd !== 'number') {
            return this.once('open', this._write.bind(this, chunk, encoding, callback))
        }

        fs.write(this.fd, chunk, 0, chunk.length, this.pos, (err, byteWritten) => {
            if (err){
                return this._errorHander();
            }
            this._length -= byteWritten;
            this._pos += byteWritten;
            callback();
        });
    }

    clearBuffer() {
        let buf = this.buffers.shift();

        if (buf) {
            this._write(buf.chunk, buf.encoding, () => {
                
                buf.callback();
                this.clearBuffer()
            });
        } else {
            this._writing = false;
            if (this._needDrain) {
                // 是否需要触发drain 需要就发射drain事件
                this._needDrain = false;
                this.emit('drain');
            }
        }
    }

    destroy() {
        if (typeof this.fd !== 'number') {
            return this.emit('close');
        }
        fs.close(this.fd, () => {
            this.emit('close')
        })
    }

    _errorHander(err) {
        this.emit('error', err);
        if (this.autoClose) {
            this.destroy();
        }
    }
}

module.exports = WriteStream;

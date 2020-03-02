/**
 * 简单的行读取器
 * Unix系统中使用 /n
 * windows中使用 /r/n
 * mac中使用 /r
 * 在 ascii 中:
 * \n  10 0x0a  换行
 * \r  13 0xod  回车CR
 */

const EventEmitter = require('events');
const fs = require('fs');

const RETURN_CHAR = 0x0d;
const NEWLINE_CHAR = 0x0a;

class ReadLine extends EventEmitter {

    constructor(path) {
        super();

        this._rs = fs.createReadStream(path, {
            highWaterMark: 6
        });

        this.buf = [];

        this.on('newListener', (eventName) => {
            if (eventName === 'readLine') {
                this._rs.on('readable', () => {
                    let char;
                    let buf = [];

                    while ((char = this._rs.read(1))) {
                        switch (char[0]) {
                            case NEWLINE_CHAR:
                                this.emitNewLine();
                                break;
                            case RETURN_CHAR:
                                this.emitNewLine();
                                // 如果不是/r ,则数据写到缓存中
                                let newchar = this._rs.read(1);
                                if (newchar[0] !== NEWLINE_CHAR) {
                                    this.buf.push(newchar[0])
                                }
                                break;
                            default:
                                this.buf.push(char[0])
                        }
                    }
                })

                this._rs.on('end', () => {
                    this.emitNewLine()
                    this.emit('end')
                })
            }
        })
    }

    emitNewLine() {
        this.emit('readLine', Buffer.from(this.buf));
        this.buf = [];
    }
}

module.exports = ReadLine;
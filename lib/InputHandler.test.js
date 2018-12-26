"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var InputHandler_1 = require("./InputHandler");
var TestUtils_test_1 = require("./utils/TestUtils.test");
var Buffer_1 = require("./Buffer");
var Terminal_1 = require("./Terminal");
var OldInputHandler = (function (_super) {
    __extends(OldInputHandler, _super);
    function OldInputHandler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OldInputHandler.prototype.eraseInLine = function (params) {
        switch (params[0]) {
            case 0:
                this.eraseRight(this._terminal.buffer.x, this._terminal.buffer.y);
                break;
            case 1:
                this.eraseLeft(this._terminal.buffer.x, this._terminal.buffer.y);
                break;
            case 2:
                this.eraseLine(this._terminal.buffer.y);
                break;
        }
    };
    OldInputHandler.prototype.eraseInDisplay = function (params) {
        var j;
        switch (params[0]) {
            case 0:
                this.eraseRight(this._terminal.buffer.x, this._terminal.buffer.y);
                j = this._terminal.buffer.y + 1;
                for (; j < this._terminal.rows; j++) {
                    this.eraseLine(j);
                }
                break;
            case 1:
                this.eraseLeft(this._terminal.buffer.x, this._terminal.buffer.y);
                j = this._terminal.buffer.y;
                while (j--) {
                    this.eraseLine(j);
                }
                break;
            case 2:
                j = this._terminal.rows;
                while (j--)
                    this.eraseLine(j);
                break;
            case 3:
                var scrollBackSize = this._terminal.buffer.lines.length - this._terminal.rows;
                if (scrollBackSize > 0) {
                    this._terminal.buffer.lines.trimStart(scrollBackSize);
                    this._terminal.buffer.ybase = Math.max(this._terminal.buffer.ybase - scrollBackSize, 0);
                    this._terminal.buffer.ydisp = Math.max(this._terminal.buffer.ydisp - scrollBackSize, 0);
                    this._terminal.emit('scroll', 0);
                }
                break;
        }
    };
    OldInputHandler.prototype.eraseRight = function (x, y) {
        var line = this._terminal.buffer.lines.get(this._terminal.buffer.ybase + y);
        if (!line) {
            return;
        }
        line.replaceCells(x, this._terminal.cols, [this._terminal.eraseAttr(), Buffer_1.NULL_CELL_CHAR, Buffer_1.NULL_CELL_WIDTH, Buffer_1.NULL_CELL_CODE]);
        this._terminal.updateRange(y);
    };
    OldInputHandler.prototype.eraseLeft = function (x, y) {
        var line = this._terminal.buffer.lines.get(this._terminal.buffer.ybase + y);
        if (!line) {
            return;
        }
        line.replaceCells(0, x + 1, [this._terminal.eraseAttr(), Buffer_1.NULL_CELL_CHAR, Buffer_1.NULL_CELL_WIDTH, Buffer_1.NULL_CELL_CODE]);
        this._terminal.updateRange(y);
    };
    OldInputHandler.prototype.eraseLine = function (y) {
        this.eraseRight(0, y);
    };
    OldInputHandler.prototype.insertChars = function (params) {
        var param = params[0];
        if (param < 1)
            param = 1;
        var buffer = this._terminal.buffer;
        var row = buffer.y + buffer.ybase;
        var j = buffer.x;
        while (param-- && j < this._terminal.cols) {
            buffer.lines.get(row).insertCells(j++, 1, [this._terminal.eraseAttr(), Buffer_1.NULL_CELL_CHAR, Buffer_1.NULL_CELL_WIDTH, Buffer_1.NULL_CELL_CODE]);
        }
    };
    OldInputHandler.prototype.deleteChars = function (params) {
        var param = params[0];
        if (param < 1) {
            param = 1;
        }
        var buffer = this._terminal.buffer;
        var row = buffer.y + buffer.ybase;
        while (param--) {
            buffer.lines.get(row).deleteCells(buffer.x, 1, [this._terminal.eraseAttr(), Buffer_1.NULL_CELL_CHAR, Buffer_1.NULL_CELL_WIDTH, Buffer_1.NULL_CELL_CODE]);
        }
        this._terminal.updateRange(buffer.y);
    };
    return OldInputHandler;
}(InputHandler_1.InputHandler));
describe('InputHandler', function () {
    describe('save and restore cursor', function () {
        var terminal = new TestUtils_test_1.MockInputHandlingTerminal();
        terminal.buffer.x = 1;
        terminal.buffer.y = 2;
        terminal.curAttr = 3;
        var inputHandler = new InputHandler_1.InputHandler(terminal);
        inputHandler.saveCursor([]);
        chai_1.assert.equal(terminal.buffer.x, 1);
        chai_1.assert.equal(terminal.buffer.y, 2);
        chai_1.assert.equal(terminal.curAttr, 3);
        terminal.buffer.x = 10;
        terminal.buffer.y = 20;
        terminal.curAttr = 30;
        inputHandler.restoreCursor([]);
        chai_1.assert.equal(terminal.buffer.x, 1);
        chai_1.assert.equal(terminal.buffer.y, 2);
        chai_1.assert.equal(terminal.curAttr, 3);
    });
    describe('setCursorStyle', function () {
        it('should call Terminal.setOption with correct params', function () {
            var terminal = new TestUtils_test_1.MockInputHandlingTerminal();
            var inputHandler = new InputHandler_1.InputHandler(terminal);
            var collect = ' ';
            inputHandler.setCursorStyle([0], collect);
            chai_1.assert.equal(terminal.options['cursorStyle'], 'block');
            chai_1.assert.equal(terminal.options['cursorBlink'], true);
            terminal.options = {};
            inputHandler.setCursorStyle([1], collect);
            chai_1.assert.equal(terminal.options['cursorStyle'], 'block');
            chai_1.assert.equal(terminal.options['cursorBlink'], true);
            terminal.options = {};
            inputHandler.setCursorStyle([2], collect);
            chai_1.assert.equal(terminal.options['cursorStyle'], 'block');
            chai_1.assert.equal(terminal.options['cursorBlink'], false);
            terminal.options = {};
            inputHandler.setCursorStyle([3], collect);
            chai_1.assert.equal(terminal.options['cursorStyle'], 'underline');
            chai_1.assert.equal(terminal.options['cursorBlink'], true);
            terminal.options = {};
            inputHandler.setCursorStyle([4], collect);
            chai_1.assert.equal(terminal.options['cursorStyle'], 'underline');
            chai_1.assert.equal(terminal.options['cursorBlink'], false);
            terminal.options = {};
            inputHandler.setCursorStyle([5], collect);
            chai_1.assert.equal(terminal.options['cursorStyle'], 'bar');
            chai_1.assert.equal(terminal.options['cursorBlink'], true);
            terminal.options = {};
            inputHandler.setCursorStyle([6], collect);
            chai_1.assert.equal(terminal.options['cursorStyle'], 'bar');
            chai_1.assert.equal(terminal.options['cursorBlink'], false);
        });
    });
    describe('setMode', function () {
        it('should toggle Terminal.bracketedPasteMode', function () {
            var terminal = new TestUtils_test_1.MockInputHandlingTerminal();
            var collect = '?';
            terminal.bracketedPasteMode = false;
            var inputHandler = new InputHandler_1.InputHandler(terminal);
            inputHandler.setMode([2004], collect);
            chai_1.assert.equal(terminal.bracketedPasteMode, true);
            inputHandler.resetMode([2004], collect);
            chai_1.assert.equal(terminal.bracketedPasteMode, false);
        });
    });
    describe('regression tests', function () {
        function lineContent(line) {
            var content = '';
            for (var i = 0; i < line.length; ++i)
                content += line.get(i)[Buffer_1.CHAR_DATA_CHAR_INDEX];
            return content;
        }
        function termContent(term) {
            var result = [];
            for (var i = 0; i < term.rows; ++i)
                result.push(lineContent(term.buffer.lines.get(i)));
            return result;
        }
        it('insertChars', function () {
            var term = new Terminal_1.Terminal();
            var inputHandler = new InputHandler_1.InputHandler(term);
            var oldInputHandler = new OldInputHandler(term);
            inputHandler.parse(Array(term.cols - 9).join('a'));
            inputHandler.parse('1234567890');
            inputHandler.parse(Array(term.cols - 9).join('a'));
            inputHandler.parse('1234567890');
            var line1 = term.buffer.lines.get(0);
            var line2 = term.buffer.lines.get(1);
            chai_1.expect(lineContent(line1)).equals(Array(term.cols - 9).join('a') + '1234567890');
            chai_1.expect(lineContent(line2)).equals(Array(term.cols - 9).join('a') + '1234567890');
            term.buffer.y = 0;
            term.buffer.x = 70;
            oldInputHandler.insertChars([0]);
            chai_1.expect(lineContent(line1)).equals(Array(term.cols - 9).join('a') + ' 123456789');
            term.buffer.y = 1;
            term.buffer.x = 70;
            inputHandler.insertChars([0]);
            chai_1.expect(lineContent(line2)).equals(Array(term.cols - 9).join('a') + ' 123456789');
            chai_1.expect(lineContent(line2)).equals(lineContent(line1));
            term.buffer.y = 0;
            term.buffer.x = 70;
            oldInputHandler.insertChars([1]);
            chai_1.expect(lineContent(line1)).equals(Array(term.cols - 9).join('a') + '  12345678');
            term.buffer.y = 1;
            term.buffer.x = 70;
            inputHandler.insertChars([1]);
            chai_1.expect(lineContent(line2)).equals(Array(term.cols - 9).join('a') + '  12345678');
            chai_1.expect(lineContent(line2)).equals(lineContent(line1));
            term.buffer.y = 0;
            term.buffer.x = 70;
            oldInputHandler.insertChars([2]);
            chai_1.expect(lineContent(line1)).equals(Array(term.cols - 9).join('a') + '    123456');
            term.buffer.y = 1;
            term.buffer.x = 70;
            inputHandler.insertChars([2]);
            chai_1.expect(lineContent(line2)).equals(Array(term.cols - 9).join('a') + '    123456');
            chai_1.expect(lineContent(line2)).equals(lineContent(line1));
            term.buffer.y = 0;
            term.buffer.x = 70;
            oldInputHandler.insertChars([10]);
            chai_1.expect(lineContent(line1)).equals(Array(term.cols - 9).join('a') + '          ');
            term.buffer.y = 1;
            term.buffer.x = 70;
            inputHandler.insertChars([10]);
            chai_1.expect(lineContent(line2)).equals(Array(term.cols - 9).join('a') + '          ');
            chai_1.expect(lineContent(line2)).equals(lineContent(line1));
        });
        it('deleteChars', function () {
            var term = new Terminal_1.Terminal();
            var inputHandler = new InputHandler_1.InputHandler(term);
            var oldInputHandler = new OldInputHandler(term);
            inputHandler.parse(Array(term.cols - 9).join('a'));
            inputHandler.parse('1234567890');
            inputHandler.parse(Array(term.cols - 9).join('a'));
            inputHandler.parse('1234567890');
            var line1 = term.buffer.lines.get(0);
            var line2 = term.buffer.lines.get(1);
            chai_1.expect(lineContent(line1)).equals(Array(term.cols - 9).join('a') + '1234567890');
            chai_1.expect(lineContent(line2)).equals(Array(term.cols - 9).join('a') + '1234567890');
            term.buffer.y = 0;
            term.buffer.x = 70;
            oldInputHandler.deleteChars([0]);
            chai_1.expect(lineContent(line1)).equals(Array(term.cols - 9).join('a') + '234567890 ');
            term.buffer.y = 1;
            term.buffer.x = 70;
            inputHandler.deleteChars([0]);
            chai_1.expect(lineContent(line2)).equals(Array(term.cols - 9).join('a') + '234567890 ');
            chai_1.expect(lineContent(line2)).equals(lineContent(line1));
            term.buffer.y = 0;
            term.buffer.x = 70;
            oldInputHandler.deleteChars([1]);
            chai_1.expect(lineContent(line1)).equals(Array(term.cols - 9).join('a') + '34567890  ');
            term.buffer.y = 1;
            term.buffer.x = 70;
            inputHandler.deleteChars([1]);
            chai_1.expect(lineContent(line2)).equals(Array(term.cols - 9).join('a') + '34567890  ');
            chai_1.expect(lineContent(line2)).equals(lineContent(line1));
            term.buffer.y = 0;
            term.buffer.x = 70;
            oldInputHandler.deleteChars([2]);
            chai_1.expect(lineContent(line1)).equals(Array(term.cols - 9).join('a') + '567890    ');
            term.buffer.y = 1;
            term.buffer.x = 70;
            inputHandler.deleteChars([2]);
            chai_1.expect(lineContent(line2)).equals(Array(term.cols - 9).join('a') + '567890    ');
            chai_1.expect(lineContent(line2)).equals(lineContent(line1));
            term.buffer.y = 0;
            term.buffer.x = 70;
            oldInputHandler.deleteChars([10]);
            chai_1.expect(lineContent(line1)).equals(Array(term.cols - 9).join('a') + '          ');
            term.buffer.y = 1;
            term.buffer.x = 70;
            inputHandler.deleteChars([10]);
            chai_1.expect(lineContent(line2)).equals(Array(term.cols - 9).join('a') + '          ');
            chai_1.expect(lineContent(line2)).equals(lineContent(line1));
        });
        it('eraseInLine', function () {
            var term = new Terminal_1.Terminal();
            var inputHandler = new InputHandler_1.InputHandler(term);
            var oldInputHandler = new OldInputHandler(term);
            inputHandler.parse(Array(term.cols + 1).join('a'));
            inputHandler.parse(Array(term.cols + 1).join('a'));
            inputHandler.parse(Array(term.cols + 1).join('a'));
            inputHandler.parse(Array(term.cols + 1).join('a'));
            inputHandler.parse(Array(term.cols + 1).join('a'));
            inputHandler.parse(Array(term.cols + 1).join('a'));
            term.buffer.y = 0;
            term.buffer.x = 70;
            oldInputHandler.eraseInLine([0]);
            chai_1.expect(lineContent(term.buffer.lines.get(0))).equals(Array(71).join('a') + '          ');
            term.buffer.y = 1;
            term.buffer.x = 70;
            inputHandler.eraseInLine([0]);
            chai_1.expect(lineContent(term.buffer.lines.get(1))).equals(Array(71).join('a') + '          ');
            term.buffer.y = 2;
            term.buffer.x = 70;
            oldInputHandler.eraseInLine([1]);
            chai_1.expect(lineContent(term.buffer.lines.get(2))).equals(Array(71).join(' ') + ' aaaaaaaaa');
            term.buffer.y = 3;
            term.buffer.x = 70;
            inputHandler.eraseInLine([1]);
            chai_1.expect(lineContent(term.buffer.lines.get(3))).equals(Array(71).join(' ') + ' aaaaaaaaa');
            term.buffer.y = 4;
            term.buffer.x = 70;
            oldInputHandler.eraseInLine([2]);
            chai_1.expect(lineContent(term.buffer.lines.get(4))).equals(Array(term.cols + 1).join(' '));
            term.buffer.y = 5;
            term.buffer.x = 70;
            inputHandler.eraseInLine([2]);
            chai_1.expect(lineContent(term.buffer.lines.get(5))).equals(Array(term.cols + 1).join(' '));
        });
        it('eraseInDisplay', function () {
            var termOld = new Terminal_1.Terminal();
            var inputHandlerOld = new OldInputHandler(termOld);
            var termNew = new Terminal_1.Terminal();
            var inputHandlerNew = new InputHandler_1.InputHandler(termNew);
            for (var i = 0; i < termOld.rows; ++i)
                inputHandlerOld.parse(Array(termOld.cols + 1).join('a'));
            for (var i = 0; i < termNew.rows; ++i)
                inputHandlerNew.parse(Array(termOld.cols + 1).join('a'));
            var data = [];
            for (var i = 0; i < termOld.rows; ++i)
                data.push(Array(termOld.cols + 1).join('a'));
            chai_1.expect(termContent(termOld)).eql(data);
            chai_1.expect(termContent(termOld)).eql(termContent(termNew));
            termOld.buffer.y = 5;
            termOld.buffer.x = 40;
            inputHandlerOld.eraseInDisplay([0]);
            termNew.buffer.y = 5;
            termNew.buffer.x = 40;
            inputHandlerNew.eraseInDisplay([0]);
            chai_1.expect(termContent(termNew)).eql(termContent(termOld));
            termOld.buffer.y = 0;
            termOld.buffer.x = 0;
            termNew.buffer.y = 0;
            termNew.buffer.x = 0;
            for (var i = 0; i < termOld.rows; ++i)
                inputHandlerOld.parse(Array(termOld.cols + 1).join('a'));
            for (var i = 0; i < termNew.rows; ++i)
                inputHandlerNew.parse(Array(termOld.cols + 1).join('a'));
            termOld.buffer.y = 5;
            termOld.buffer.x = 40;
            inputHandlerOld.eraseInDisplay([1]);
            termNew.buffer.y = 5;
            termNew.buffer.x = 40;
            inputHandlerNew.eraseInDisplay([1]);
            chai_1.expect(termContent(termNew)).eql(termContent(termOld));
            termOld.buffer.y = 0;
            termOld.buffer.x = 0;
            termNew.buffer.y = 0;
            termNew.buffer.x = 0;
            for (var i = 0; i < termOld.rows; ++i)
                inputHandlerOld.parse(Array(termOld.cols + 1).join('a'));
            for (var i = 0; i < termNew.rows; ++i)
                inputHandlerNew.parse(Array(termOld.cols + 1).join('a'));
            termOld.buffer.y = 5;
            termOld.buffer.x = 40;
            inputHandlerOld.eraseInDisplay([2]);
            termNew.buffer.y = 5;
            termNew.buffer.x = 40;
            inputHandlerNew.eraseInDisplay([2]);
            chai_1.expect(termContent(termNew)).eql(termContent(termOld));
            termNew.buffer.y = 0;
            termNew.buffer.x = 0;
            inputHandlerNew.parse(Array(termNew.cols + 1).join('a'));
            inputHandlerNew.parse(Array(termNew.cols + 10).join('a'));
            for (var i = 3; i < termOld.rows; ++i)
                inputHandlerNew.parse(Array(termNew.cols + 1).join('a'));
            chai_1.expect(termNew.buffer.lines.get(2).isWrapped).true;
            termNew.buffer.y = 2;
            termNew.buffer.x = 40;
            inputHandlerNew.eraseInDisplay([1]);
            chai_1.expect(termNew.buffer.lines.get(2).isWrapped).false;
            termNew.buffer.y = 0;
            termNew.buffer.x = 0;
            inputHandlerNew.parse(Array(termNew.cols + 1).join('a'));
            inputHandlerNew.parse(Array(termNew.cols + 10).join('a'));
            for (var i = 3; i < termOld.rows; ++i)
                inputHandlerNew.parse(Array(termNew.cols + 1).join('a'));
            chai_1.expect(termNew.buffer.lines.get(2).isWrapped).true;
            termNew.buffer.y = 1;
            termNew.buffer.x = 90;
            inputHandlerNew.eraseInDisplay([1]);
            chai_1.expect(termNew.buffer.lines.get(2).isWrapped).false;
        });
    });
    it('convertEol setting', function () {
        var s = '';
        var termNotConverting = new Terminal_1.Terminal({ cols: 15, rows: 10 });
        termNotConverting._inputHandler.parse('Hello\nWorld');
        for (var i = 0; i < termNotConverting.cols; ++i) {
            s += termNotConverting.buffer.lines.get(0).get(i)[Buffer_1.CHAR_DATA_CHAR_INDEX];
        }
        chai_1.expect(s).equals('Hello          ');
        s = '';
        for (var i = 0; i < termNotConverting.cols; ++i) {
            s += termNotConverting.buffer.lines.get(1).get(i)[Buffer_1.CHAR_DATA_CHAR_INDEX];
        }
        chai_1.expect(s).equals('     World     ');
        s = '';
        var termConverting = new Terminal_1.Terminal({ cols: 15, rows: 10, convertEol: true });
        termConverting._inputHandler.parse('Hello\nWorld');
        for (var i = 0; i < termConverting.cols; ++i) {
            s += termConverting.buffer.lines.get(0).get(i)[Buffer_1.CHAR_DATA_CHAR_INDEX];
        }
        chai_1.expect(s).equals('Hello          ');
        s = '';
        for (var i = 0; i < termConverting.cols; ++i) {
            s += termConverting.buffer.lines.get(1).get(i)[Buffer_1.CHAR_DATA_CHAR_INDEX];
        }
        chai_1.expect(s).equals('World          ');
    });
    describe('print', function () {
        it('should not cause an infinite loop (regression test)', function () {
            var term = new Terminal_1.Terminal();
            var inputHandler = new InputHandler_1.InputHandler(term);
            inputHandler.print(String.fromCharCode(0x200B), 0, 1);
        });
    });
    describe('alt screen', function () {
        var term;
        var handler;
        function lineContent(line) {
            var content = '';
            for (var i = 0; i < line.length; ++i)
                content += line.get(i)[Buffer_1.CHAR_DATA_CHAR_INDEX];
            return content;
        }
        beforeEach(function () {
            term = new Terminal_1.Terminal();
            handler = new InputHandler_1.InputHandler(term);
        });
        it('should handle DECSET/DECRST 47 (alt screen buffer)', function () {
            handler.parse('\x1b[?47h\r\n\x1b[31mJUNK\x1b[?47lTEST');
            chai_1.expect(lineContent(term.buffer.lines.get(0))).to.equal(Array(term.cols + 1).join(' '));
            chai_1.expect(lineContent(term.buffer.lines.get(1))).to.equal('    TEST' + Array(term.cols - 7).join(' '));
            chai_1.expect((term.buffer.lines.get(1).get(4)[Buffer_1.CHAR_DATA_ATTR_INDEX] >> 9) & 0x1ff).to.equal(1);
        });
        it('should handle DECSET/DECRST 1047 (alt screen buffer)', function () {
            handler.parse('\x1b[?1047h\r\n\x1b[31mJUNK\x1b[?1047lTEST');
            chai_1.expect(lineContent(term.buffer.lines.get(0))).to.equal(Array(term.cols + 1).join(' '));
            chai_1.expect(lineContent(term.buffer.lines.get(1))).to.equal('    TEST' + Array(term.cols - 7).join(' '));
            chai_1.expect((term.buffer.lines.get(1).get(4)[Buffer_1.CHAR_DATA_ATTR_INDEX] >> 9) & 0x1ff).to.equal(1);
        });
        it('should handle DECSET/DECRST 1048 (alt screen cursor)', function () {
            handler.parse('\x1b[?1048h\r\n\x1b[31mJUNK\x1b[?1048lTEST');
            chai_1.expect(lineContent(term.buffer.lines.get(0))).to.equal('TEST' + Array(term.cols - 3).join(' '));
            chai_1.expect(lineContent(term.buffer.lines.get(1))).to.equal('JUNK' + Array(term.cols - 3).join(' '));
            chai_1.expect(term.buffer.lines.get(0).get(0)[Buffer_1.CHAR_DATA_ATTR_INDEX]).to.equal(Buffer_1.DEFAULT_ATTR);
            chai_1.expect((term.buffer.lines.get(1).get(0)[Buffer_1.CHAR_DATA_ATTR_INDEX] >> 9) & 0x1ff).to.equal(1);
        });
        it('should handle DECSET/DECRST 1049 (alt screen buffer+cursor)', function () {
            handler.parse('\x1b[?1049h\r\n\x1b[31mJUNK\x1b[?1049lTEST');
            chai_1.expect(lineContent(term.buffer.lines.get(0))).to.equal('TEST' + Array(term.cols - 3).join(' '));
            chai_1.expect(lineContent(term.buffer.lines.get(1))).to.equal(Array(term.cols + 1).join(' '));
            chai_1.expect(term.buffer.lines.get(0).get(0)[Buffer_1.CHAR_DATA_ATTR_INDEX]).to.equal(Buffer_1.DEFAULT_ATTR);
        });
        it('should handle DECSET/DECRST 1049 - maintains saved cursor for alt buffer', function () {
            handler.parse('\x1b[?1049h\r\n\x1b[31m\x1b[s\x1b[?1049lTEST');
            chai_1.expect(lineContent(term.buffer.lines.get(0))).to.equal('TEST' + Array(term.cols - 3).join(' '));
            chai_1.expect(term.buffer.lines.get(0).get(0)[Buffer_1.CHAR_DATA_ATTR_INDEX]).to.equal(Buffer_1.DEFAULT_ATTR);
            handler.parse('\x1b[?1049h\x1b[uTEST');
            chai_1.expect(lineContent(term.buffer.lines.get(1))).to.equal('TEST' + Array(term.cols - 3).join(' '));
            chai_1.expect((term.buffer.lines.get(1).get(0)[Buffer_1.CHAR_DATA_ATTR_INDEX] >> 9) & 0x1ff).to.equal(1);
        });
        it('should handle DECSET/DECRST 1049 - clears alt buffer with erase attributes', function () {
            handler.parse('\x1b[42m\x1b[?1049h');
            chai_1.expect(term.buffer.lines.get(20).get(10)[Buffer_1.CHAR_DATA_ATTR_INDEX] & 0x1ff).to.equal(2);
        });
    });
});
//# sourceMappingURL=InputHandler.test.js.map
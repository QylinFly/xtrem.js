"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var Buffer_1 = require("./Buffer");
var CircularList_1 = require("./common/CircularList");
var TestUtils_test_1 = require("./utils/TestUtils.test");
var BufferLine_1 = require("./BufferLine");
var INIT_COLS = 80;
var INIT_ROWS = 24;
describe('Buffer', function () {
    var terminal;
    var buffer;
    beforeEach(function () {
        terminal = new TestUtils_test_1.MockTerminal();
        terminal.cols = INIT_COLS;
        terminal.rows = INIT_ROWS;
        terminal.options.scrollback = 1000;
        buffer = new Buffer_1.Buffer(terminal, true);
    });
    describe('constructor', function () {
        it('should create a CircularList with max length equal to rows + scrollback, for its lines', function () {
            chai_1.assert.instanceOf(buffer.lines, CircularList_1.CircularList);
            chai_1.assert.equal(buffer.lines.maxLength, terminal.rows + terminal.options.scrollback);
        });
        it('should set the Buffer\'s scrollBottom value equal to the terminal\'s rows -1', function () {
            chai_1.assert.equal(buffer.scrollBottom, terminal.rows - 1);
        });
    });
    describe('fillViewportRows', function () {
        it('should fill the buffer with blank lines based on the size of the viewport', function () {
            var blankLineChar = buffer.getBlankLine(Buffer_1.DEFAULT_ATTR).get(0);
            buffer.fillViewportRows();
            chai_1.assert.equal(buffer.lines.length, INIT_ROWS);
            for (var y = 0; y < INIT_ROWS; y++) {
                chai_1.assert.equal(buffer.lines.get(y).length, INIT_COLS);
                for (var x = 0; x < INIT_COLS; x++) {
                    chai_1.assert.deepEqual(buffer.lines.get(y).get(x), blankLineChar);
                }
            }
        });
    });
    describe('getWrappedRangeForLine', function () {
        describe('non-wrapped', function () {
            it('should return a single row for the first row', function () {
                buffer.fillViewportRows();
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(0), { first: 0, last: 0 });
            });
            it('should return a single row for a middle row', function () {
                buffer.fillViewportRows();
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(12), { first: 12, last: 12 });
            });
            it('should return a single row for the last row', function () {
                buffer.fillViewportRows();
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(buffer.lines.length - 1), { first: 23, last: 23 });
            });
        });
        describe('wrapped', function () {
            it('should return a range for the first row', function () {
                buffer.fillViewportRows();
                buffer.lines.get(1).isWrapped = true;
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(0), { first: 0, last: 1 });
            });
            it('should return a range for a middle row wrapping upwards', function () {
                buffer.fillViewportRows();
                buffer.lines.get(12).isWrapped = true;
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(12), { first: 11, last: 12 });
            });
            it('should return a range for a middle row wrapping downwards', function () {
                buffer.fillViewportRows();
                buffer.lines.get(13).isWrapped = true;
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(12), { first: 12, last: 13 });
            });
            it('should return a range for a middle row wrapping both ways', function () {
                buffer.fillViewportRows();
                buffer.lines.get(11).isWrapped = true;
                buffer.lines.get(12).isWrapped = true;
                buffer.lines.get(13).isWrapped = true;
                buffer.lines.get(14).isWrapped = true;
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(12), { first: 10, last: 14 });
            });
            it('should return a range for the last row', function () {
                buffer.fillViewportRows();
                buffer.lines.get(23).isWrapped = true;
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(buffer.lines.length - 1), { first: 22, last: 23 });
            });
            it('should return a range for a row that wraps upward to first row', function () {
                buffer.fillViewportRows();
                buffer.lines.get(1).isWrapped = true;
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(1), { first: 0, last: 1 });
            });
            it('should return a range for a row that wraps downward to last row', function () {
                buffer.fillViewportRows();
                buffer.lines.get(buffer.lines.length - 1).isWrapped = true;
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(buffer.lines.length - 2), { first: 22, last: 23 });
            });
        });
    });
    describe('resize', function () {
        describe('column size is reduced', function () {
            it('should not trim the data in the buffer', function () {
                buffer.fillViewportRows();
                buffer.resize(INIT_COLS / 2, INIT_ROWS);
                chai_1.assert.equal(buffer.lines.length, INIT_ROWS);
                for (var i = 0; i < INIT_ROWS; i++) {
                    chai_1.assert.equal(buffer.lines.get(i).length, INIT_COLS);
                }
            });
        });
        describe('column size is increased', function () {
            it('should add pad columns', function () {
                buffer.fillViewportRows();
                buffer.resize(INIT_COLS + 10, INIT_ROWS);
                chai_1.assert.equal(buffer.lines.length, INIT_ROWS);
                for (var i = 0; i < INIT_ROWS; i++) {
                    chai_1.assert.equal(buffer.lines.get(i).length, INIT_COLS + 10);
                }
            });
        });
        describe('row size reduced', function () {
            it('should trim blank lines from the end', function () {
                buffer.fillViewportRows();
                buffer.resize(INIT_COLS, INIT_ROWS - 10);
                chai_1.assert.equal(buffer.lines.length, INIT_ROWS - 10);
            });
            it('should move the viewport down when it\'s at the end', function () {
                buffer.fillViewportRows();
                buffer.y = INIT_ROWS - 5 - 1;
                buffer.resize(INIT_COLS, INIT_ROWS - 10);
                chai_1.assert.equal(buffer.lines.length, INIT_ROWS - 5);
                chai_1.assert.equal(buffer.ydisp, 5);
                chai_1.assert.equal(buffer.ybase, 5);
            });
            describe('no scrollback', function () {
                it('should trim from the top of the buffer when the cursor reaches the bottom', function () {
                    terminal.options.scrollback = 0;
                    buffer = new Buffer_1.Buffer(terminal, true);
                    chai_1.assert.equal(buffer.lines.maxLength, INIT_ROWS);
                    buffer.y = INIT_ROWS - 1;
                    buffer.fillViewportRows();
                    var chData = buffer.lines.get(5).get(0);
                    chData[1] = 'a';
                    buffer.lines.get(5).set(0, chData);
                    chData = buffer.lines.get(INIT_ROWS - 1).get(0);
                    chData[1] = 'b';
                    buffer.lines.get(INIT_ROWS - 1).set(0, chData);
                    buffer.resize(INIT_COLS, INIT_ROWS - 5);
                    chai_1.assert.equal(buffer.lines.get(0).get(0)[1], 'a');
                    chai_1.assert.equal(buffer.lines.get(INIT_ROWS - 1 - 5).get(0)[1], 'b');
                });
            });
        });
        describe('row size increased', function () {
            describe('empty buffer', function () {
                it('should add blank lines to end', function () {
                    buffer.fillViewportRows();
                    chai_1.assert.equal(buffer.ydisp, 0);
                    buffer.resize(INIT_COLS, INIT_ROWS + 10);
                    chai_1.assert.equal(buffer.ydisp, 0);
                    chai_1.assert.equal(buffer.lines.length, INIT_ROWS + 10);
                });
            });
            describe('filled buffer', function () {
                it('should show more of the buffer above', function () {
                    buffer.fillViewportRows();
                    for (var i = 0; i < 10; i++) {
                        buffer.lines.push(buffer.getBlankLine(Buffer_1.DEFAULT_ATTR));
                    }
                    buffer.y = INIT_ROWS - 1;
                    buffer.ybase = 10;
                    buffer.ydisp = 10;
                    chai_1.assert.equal(buffer.lines.length, INIT_ROWS + 10);
                    buffer.resize(INIT_COLS, INIT_ROWS + 5);
                    chai_1.assert.equal(buffer.ydisp, 5);
                    chai_1.assert.equal(buffer.ybase, 5);
                    chai_1.assert.equal(buffer.lines.length, INIT_ROWS + 10);
                });
                it('should show more of the buffer below when the viewport is at the top of the buffer', function () {
                    buffer.fillViewportRows();
                    for (var i = 0; i < 10; i++) {
                        buffer.lines.push(buffer.getBlankLine(Buffer_1.DEFAULT_ATTR));
                    }
                    buffer.y = INIT_ROWS - 1;
                    buffer.ybase = 10;
                    buffer.ydisp = 0;
                    chai_1.assert.equal(buffer.lines.length, INIT_ROWS + 10);
                    buffer.resize(INIT_COLS, INIT_ROWS + 5);
                    chai_1.assert.equal(buffer.ydisp, 0);
                    chai_1.assert.equal(buffer.ybase, 5);
                    chai_1.assert.equal(buffer.lines.length, INIT_ROWS + 10);
                });
            });
        });
        describe('row and column increased', function () {
            it('should resize properly', function () {
                buffer.fillViewportRows();
                buffer.resize(INIT_COLS + 5, INIT_ROWS + 5);
                chai_1.assert.equal(buffer.lines.length, INIT_ROWS + 5);
                for (var i = 0; i < INIT_ROWS + 5; i++) {
                    chai_1.assert.equal(buffer.lines.get(i).length, INIT_COLS + 5);
                }
            });
        });
    });
    describe('buffer marked to have no scrollback', function () {
        it('should always have a scrollback of 0', function () {
            chai_1.assert.equal(terminal.options.scrollback, 1000);
            buffer = new Buffer_1.Buffer(terminal, false);
            buffer.fillViewportRows();
            chai_1.assert.equal(buffer.lines.maxLength, INIT_ROWS);
            buffer.resize(INIT_COLS, INIT_ROWS * 2);
            chai_1.assert.equal(buffer.lines.maxLength, INIT_ROWS * 2);
            buffer.resize(INIT_COLS, INIT_ROWS / 2);
            chai_1.assert.equal(buffer.lines.maxLength, INIT_ROWS / 2);
        });
    });
    describe('addMarker', function () {
        it('should adjust a marker line when the buffer is trimmed', function () {
            terminal.options.scrollback = 0;
            buffer = new Buffer_1.Buffer(terminal, true);
            buffer.fillViewportRows();
            var marker = buffer.addMarker(buffer.lines.length - 1);
            chai_1.assert.equal(marker.line, buffer.lines.length - 1);
            buffer.lines.emit('trim', 1);
            chai_1.assert.equal(marker.line, buffer.lines.length - 2);
        });
        it('should dispose of a marker if it is trimmed off the buffer', function () {
            terminal.options.scrollback = 0;
            buffer = new Buffer_1.Buffer(terminal, true);
            buffer.fillViewportRows();
            chai_1.assert.equal(buffer.markers.length, 0);
            var marker = buffer.addMarker(0);
            chai_1.assert.equal(marker.isDisposed, false);
            chai_1.assert.equal(buffer.markers.length, 1);
            buffer.lines.emit('trim', 1);
            chai_1.assert.equal(marker.isDisposed, true);
            chai_1.assert.equal(buffer.markers.length, 0);
        });
    });
    describe('translateBufferLineToString', function () {
        it('should handle selecting a section of ascii text', function () {
            var line = new BufferLine_1.BufferLine(4);
            line.set(0, [null, 'a', 1, 'a'.charCodeAt(0)]);
            line.set(1, [null, 'b', 1, 'b'.charCodeAt(0)]);
            line.set(2, [null, 'c', 1, 'c'.charCodeAt(0)]);
            line.set(3, [null, 'd', 1, 'd'.charCodeAt(0)]);
            buffer.lines.set(0, line);
            var str = buffer.translateBufferLineToString(0, true, 0, 2);
            chai_1.assert.equal(str, 'ab');
        });
        it('should handle a cut-off double width character by including it', function () {
            var line = new BufferLine_1.BufferLine(3);
            line.set(0, [null, '語', 2, 35486]);
            line.set(1, [null, '', 0, null]);
            line.set(2, [null, 'a', 1, 'a'.charCodeAt(0)]);
            buffer.lines.set(0, line);
            var str1 = buffer.translateBufferLineToString(0, true, 0, 1);
            chai_1.assert.equal(str1, '語');
        });
        it('should handle a zero width character in the middle of the string by not including it', function () {
            var line = new BufferLine_1.BufferLine(3);
            line.set(0, [null, '語', 2, '語'.charCodeAt(0)]);
            line.set(1, [null, '', 0, null]);
            line.set(2, [null, 'a', 1, 'a'.charCodeAt(0)]);
            buffer.lines.set(0, line);
            var str0 = buffer.translateBufferLineToString(0, true, 0, 1);
            chai_1.assert.equal(str0, '語');
            var str1 = buffer.translateBufferLineToString(0, true, 0, 2);
            chai_1.assert.equal(str1, '語');
            var str2 = buffer.translateBufferLineToString(0, true, 0, 3);
            chai_1.assert.equal(str2, '語a');
        });
        it('should handle single width emojis', function () {
            var line = new BufferLine_1.BufferLine(2);
            line.set(0, [null, '😁', 1, '😁'.charCodeAt(0)]);
            line.set(1, [null, 'a', 1, 'a'.charCodeAt(0)]);
            buffer.lines.set(0, line);
            var str1 = buffer.translateBufferLineToString(0, true, 0, 1);
            chai_1.assert.equal(str1, '😁');
            var str2 = buffer.translateBufferLineToString(0, true, 0, 2);
            chai_1.assert.equal(str2, '😁a');
        });
        it('should handle double width emojis', function () {
            var line = new BufferLine_1.BufferLine(2);
            line.set(0, [null, '😁', 2, '😁'.charCodeAt(0)]);
            line.set(1, [null, '', 0, null]);
            buffer.lines.set(0, line);
            var str1 = buffer.translateBufferLineToString(0, true, 0, 1);
            chai_1.assert.equal(str1, '😁');
            var str2 = buffer.translateBufferLineToString(0, true, 0, 2);
            chai_1.assert.equal(str2, '😁');
            var line2 = new BufferLine_1.BufferLine(3);
            line2.set(0, [null, '😁', 2, '😁'.charCodeAt(0)]);
            line2.set(1, [null, '', 0, null]);
            line2.set(2, [null, 'a', 1, 'a'.charCodeAt(0)]);
            buffer.lines.set(0, line2);
            var str3 = buffer.translateBufferLineToString(0, true, 0, 3);
            chai_1.assert.equal(str3, '😁a');
        });
    });
    describe('stringIndexToBufferIndex', function () {
        var terminal;
        beforeEach(function () {
            terminal = new TestUtils_test_1.TestTerminal({ rows: 5, cols: 10 });
        });
        it('multiline ascii', function () {
            var input = 'This is ASCII text spanning multiple lines.';
            terminal.writeSync(input);
            var s = terminal.buffer.iterator(true).next().content;
            chai_1.assert.equal(input, s);
            for (var i = 0; i < input.length; ++i) {
                var bufferIndex = terminal.buffer.stringIndexToBufferIndex(0, i);
                chai_1.assert.deepEqual([(i / terminal.cols) | 0, i % terminal.cols], bufferIndex);
            }
        });
        it('combining e\u0301 in a sentence', function () {
            var input = 'Sitting in the cafe\u0301 drinking coffee.';
            terminal.writeSync(input);
            var s = terminal.buffer.iterator(true).next().content;
            chai_1.assert.equal(input, s);
            for (var i = 0; i < 19; ++i) {
                var bufferIndex = terminal.buffer.stringIndexToBufferIndex(0, i);
                chai_1.assert.deepEqual([(i / terminal.cols) | 0, i % terminal.cols], bufferIndex);
            }
            chai_1.assert.deepEqual(terminal.buffer.stringIndexToBufferIndex(0, 18), terminal.buffer.stringIndexToBufferIndex(0, 19));
            for (var i = 19; i < input.length; ++i) {
                var bufferIndex = terminal.buffer.stringIndexToBufferIndex(0, i);
                chai_1.assert.deepEqual([((i - 1) / terminal.cols) | 0, (i - 1) % terminal.cols], bufferIndex);
            }
        });
        it('multiline combining e\u0301', function () {
            var input = 'e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301';
            terminal.writeSync(input);
            var s = terminal.buffer.iterator(true).next().content;
            chai_1.assert.equal(input, s);
            for (var i = 0; i < input.length; ++i) {
                var bufferIndex = terminal.buffer.stringIndexToBufferIndex(0, i);
                chai_1.assert.deepEqual([((i >> 1) / terminal.cols) | 0, (i >> 1) % terminal.cols], bufferIndex);
            }
        });
        it('surrogate char in a sentence', function () {
            var input = 'The 𝄞 is a clef widely used in modern notation.';
            terminal.writeSync(input);
            var s = terminal.buffer.iterator(true).next().content;
            chai_1.assert.equal(input, s);
            for (var i = 0; i < 5; ++i) {
                var bufferIndex = terminal.buffer.stringIndexToBufferIndex(0, i);
                chai_1.assert.deepEqual([(i / terminal.cols) | 0, i % terminal.cols], bufferIndex);
            }
            chai_1.assert.deepEqual(terminal.buffer.stringIndexToBufferIndex(0, 4), terminal.buffer.stringIndexToBufferIndex(0, 5));
            for (var i = 5; i < input.length; ++i) {
                var bufferIndex = terminal.buffer.stringIndexToBufferIndex(0, i);
                chai_1.assert.deepEqual([((i - 1) / terminal.cols) | 0, (i - 1) % terminal.cols], bufferIndex);
            }
        });
        it('multiline surrogate char', function () {
            var input = '𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞';
            terminal.writeSync(input);
            var s = terminal.buffer.iterator(true).next().content;
            chai_1.assert.equal(input, s);
            for (var i = 0; i < input.length; ++i) {
                var bufferIndex = terminal.buffer.stringIndexToBufferIndex(0, i);
                chai_1.assert.deepEqual([((i >> 1) / terminal.cols) | 0, (i >> 1) % terminal.cols], bufferIndex);
            }
        });
        it('surrogate char with combining', function () {
            var input = '𓂀\u0301 - the eye hiroglyph with an acute accent.';
            terminal.writeSync(input);
            var s = terminal.buffer.iterator(true).next().content;
            chai_1.assert.equal(input, s);
            chai_1.assert.deepEqual([0, 0], terminal.buffer.stringIndexToBufferIndex(0, 1));
            chai_1.assert.deepEqual([0, 0], terminal.buffer.stringIndexToBufferIndex(0, 2));
            for (var i = 2; i < input.length; ++i) {
                var bufferIndex = terminal.buffer.stringIndexToBufferIndex(0, i);
                chai_1.assert.deepEqual([((i - 2) / terminal.cols) | 0, (i - 2) % terminal.cols], bufferIndex);
            }
        });
        it('multiline surrogate with combining', function () {
            var input = '𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301';
            terminal.writeSync(input);
            var s = terminal.buffer.iterator(true).next().content;
            chai_1.assert.equal(input, s);
            for (var i = 0; i < input.length; ++i) {
                var bufferIndex = terminal.buffer.stringIndexToBufferIndex(0, i);
                chai_1.assert.deepEqual([(((i / 3) | 0) / terminal.cols) | 0, ((i / 3) | 0) % terminal.cols], bufferIndex);
            }
        });
        it('fullwidth chars', function () {
            var input = 'These １２３ are some fat numbers.';
            terminal.writeSync(input);
            var s = terminal.buffer.iterator(true).next().content;
            chai_1.assert.equal(input, s);
            for (var i = 0; i < 6; ++i) {
                var bufferIndex = terminal.buffer.stringIndexToBufferIndex(0, i);
                chai_1.assert.deepEqual([(i / terminal.cols) | 0, i % terminal.cols], bufferIndex);
            }
            chai_1.assert.deepEqual([0, 8], terminal.buffer.stringIndexToBufferIndex(0, 7));
            chai_1.assert.deepEqual([1, 0], terminal.buffer.stringIndexToBufferIndex(0, 8));
            for (var i = 9; i < input.length; ++i) {
                var bufferIndex = terminal.buffer.stringIndexToBufferIndex(0, i);
                chai_1.assert.deepEqual([((i + 3) / terminal.cols) | 0, (i + 3) % terminal.cols], bufferIndex);
            }
        });
        it('multiline fullwidth chars', function () {
            var input = '１２３４５６７８９０１２３４５６７８９０';
            terminal.writeSync(input);
            var s = terminal.buffer.iterator(true).next().content;
            chai_1.assert.equal(input, s);
            for (var i = 9; i < input.length; ++i) {
                var bufferIndex = terminal.buffer.stringIndexToBufferIndex(0, i);
                chai_1.assert.deepEqual([((i << 1) / terminal.cols) | 0, (i << 1) % terminal.cols], bufferIndex);
            }
        });
        it('fullwidth combining with emoji - match emoji cell', function () {
            var input = 'Lots of ￥\u0301 make me 😃.';
            terminal.writeSync(input);
            var s = terminal.buffer.iterator(true).next().content;
            chai_1.assert.equal(input, s);
            var stringIndex = s.match(/😃/).index;
            var bufferIndex = terminal.buffer.stringIndexToBufferIndex(0, stringIndex);
            chai_1.assert(terminal.buffer.lines.get(bufferIndex[0]).get(bufferIndex[1])[Buffer_1.CHAR_DATA_CHAR_INDEX], '😃');
        });
        it('multiline fullwidth chars with offset 1 (currently tests for broken behavior)', function () {
            var input = 'a１２３４５６７８９０１２３４５６７８９０';
            terminal.writeSync(input);
            for (var i = 10; i < input.length; ++i) {
                var bufferIndex = terminal.buffer.stringIndexToBufferIndex(0, i + 1);
                var j = (i - 0) << 1;
                chai_1.assert.deepEqual([(j / terminal.cols) | 0, j % terminal.cols], bufferIndex);
            }
        });
    });
    describe('BufferStringIterator', function () {
        it('iterator does not ovrflow buffer limits', function () {
            var terminal = new TestUtils_test_1.TestTerminal({ rows: 5, cols: 10, scrollback: 5 });
            var data = [
                'aaaaaaaaaa',
                'aaaaaaaaa\n',
                'aaaaaaaaaa',
                'aaaaaaaaa\n',
                'aaaaaaaaaa',
                'aaaaaaaaaa',
                'aaaaaaaaaa',
                'aaaaaaaaa\n',
                'aaaaaaaaaa',
                'aaaaaaaaaa'
            ];
            terminal.writeSync(data.join(''));
            chai_1.expect(function () {
                for (var overscan = 0; overscan < 20; ++overscan) {
                    for (var start = -10; start < 20; ++start) {
                        for (var end = -10; end < 20; ++end) {
                            var it_1 = terminal.buffer.iterator(false, start, end, overscan, overscan);
                            while (it_1.hasNext()) {
                                it_1.next();
                            }
                        }
                    }
                }
            }).to.not.throw();
        });
    });
});
//# sourceMappingURL=Buffer.test.js.map
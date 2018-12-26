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
var chai = require("chai");
var BufferLine_1 = require("./BufferLine");
var Buffer_1 = require("./Buffer");
var TestBufferLine = (function (_super) {
    __extends(TestBufferLine, _super);
    function TestBufferLine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TestBufferLine.prototype.toArray = function () {
        var result = [];
        for (var i = 0; i < this.length; ++i) {
            result.push(this.get(i));
        }
        return result;
    };
    return TestBufferLine;
}(BufferLine_1.BufferLine));
describe('BufferLine', function () {
    it('ctor', function () {
        var line = new TestBufferLine(0);
        chai.expect(line.length).equals(0);
        chai.expect(line.isWrapped).equals(false);
        line = new TestBufferLine(10);
        chai.expect(line.length).equals(10);
        chai.expect(line.get(0)).eql([0, Buffer_1.NULL_CELL_CHAR, Buffer_1.NULL_CELL_WIDTH, Buffer_1.NULL_CELL_CODE]);
        chai.expect(line.isWrapped).equals(false);
        line = new TestBufferLine(10, null, true);
        chai.expect(line.length).equals(10);
        chai.expect(line.get(0)).eql([0, Buffer_1.NULL_CELL_CHAR, Buffer_1.NULL_CELL_WIDTH, Buffer_1.NULL_CELL_CODE]);
        chai.expect(line.isWrapped).equals(true);
        line = new TestBufferLine(10, [123, 'a', 456, 'a'.charCodeAt(0)], true);
        chai.expect(line.length).equals(10);
        chai.expect(line.get(0)).eql([123, 'a', 456, 'a'.charCodeAt(0)]);
        chai.expect(line.isWrapped).equals(true);
    });
    it('insertCells', function () {
        var line = new TestBufferLine(3);
        line.set(0, [1, 'a', 0, 'a'.charCodeAt(0)]);
        line.set(1, [2, 'b', 0, 'b'.charCodeAt(0)]);
        line.set(2, [3, 'c', 0, 'c'.charCodeAt(0)]);
        line.insertCells(1, 3, [4, 'd', 0, 'd'.charCodeAt(0)]);
        chai.expect(line.toArray()).eql([
            [1, 'a', 0, 'a'.charCodeAt(0)],
            [4, 'd', 0, 'd'.charCodeAt(0)],
            [4, 'd', 0, 'd'.charCodeAt(0)]
        ]);
    });
    it('deleteCells', function () {
        var line = new TestBufferLine(5);
        line.set(0, [1, 'a', 0, 'a'.charCodeAt(0)]);
        line.set(1, [2, 'b', 0, 'b'.charCodeAt(0)]);
        line.set(2, [3, 'c', 0, 'c'.charCodeAt(0)]);
        line.set(3, [4, 'd', 0, 'd'.charCodeAt(0)]);
        line.set(4, [5, 'e', 0, 'e'.charCodeAt(0)]);
        line.deleteCells(1, 2, [6, 'f', 0, 'f'.charCodeAt(0)]);
        chai.expect(line.toArray()).eql([
            [1, 'a', 0, 'a'.charCodeAt(0)],
            [4, 'd', 0, 'd'.charCodeAt(0)],
            [5, 'e', 0, 'e'.charCodeAt(0)],
            [6, 'f', 0, 'f'.charCodeAt(0)],
            [6, 'f', 0, 'f'.charCodeAt(0)]
        ]);
    });
    it('replaceCells', function () {
        var line = new TestBufferLine(5);
        line.set(0, [1, 'a', 0, 'a'.charCodeAt(0)]);
        line.set(1, [2, 'b', 0, 'b'.charCodeAt(0)]);
        line.set(2, [3, 'c', 0, 'c'.charCodeAt(0)]);
        line.set(3, [4, 'd', 0, 'd'.charCodeAt(0)]);
        line.set(4, [5, 'e', 0, 'e'.charCodeAt(0)]);
        line.replaceCells(2, 4, [6, 'f', 0, 'f'.charCodeAt(0)]);
        chai.expect(line.toArray()).eql([
            [1, 'a', 0, 'a'.charCodeAt(0)],
            [2, 'b', 0, 'b'.charCodeAt(0)],
            [6, 'f', 0, 'f'.charCodeAt(0)],
            [6, 'f', 0, 'f'.charCodeAt(0)],
            [5, 'e', 0, 'e'.charCodeAt(0)]
        ]);
    });
    it('fill', function () {
        var line = new TestBufferLine(5);
        line.set(0, [1, 'a', 0, 'a'.charCodeAt(0)]);
        line.set(1, [2, 'b', 0, 'b'.charCodeAt(0)]);
        line.set(2, [3, 'c', 0, 'c'.charCodeAt(0)]);
        line.set(3, [4, 'd', 0, 'd'.charCodeAt(0)]);
        line.set(4, [5, 'e', 0, 'e'.charCodeAt(0)]);
        line.fill([123, 'z', 0, 'z'.charCodeAt(0)]);
        chai.expect(line.toArray()).eql([
            [123, 'z', 0, 'z'.charCodeAt(0)],
            [123, 'z', 0, 'z'.charCodeAt(0)],
            [123, 'z', 0, 'z'.charCodeAt(0)],
            [123, 'z', 0, 'z'.charCodeAt(0)],
            [123, 'z', 0, 'z'.charCodeAt(0)]
        ]);
    });
    it('clone', function () {
        var line = new TestBufferLine(5, null, true);
        line.set(0, [1, 'a', 0, 'a'.charCodeAt(0)]);
        line.set(1, [2, 'b', 0, 'b'.charCodeAt(0)]);
        line.set(2, [3, 'c', 0, 'c'.charCodeAt(0)]);
        line.set(3, [4, 'd', 0, 'd'.charCodeAt(0)]);
        line.set(4, [5, 'e', 0, 'e'.charCodeAt(0)]);
        var line2 = line.clone();
        chai.expect(TestBufferLine.prototype.toArray.apply(line2)).eql(line.toArray());
        chai.expect(line2.length).equals(line.length);
        chai.expect(line2.isWrapped).equals(line.isWrapped);
    });
    it('copyFrom', function () {
        var line = new TestBufferLine(5);
        line.set(0, [1, 'a', 0, 'a'.charCodeAt(0)]);
        line.set(1, [2, 'b', 0, 'b'.charCodeAt(0)]);
        line.set(2, [3, 'c', 0, 'c'.charCodeAt(0)]);
        line.set(3, [4, 'd', 0, 'd'.charCodeAt(0)]);
        line.set(4, [5, 'e', 0, 'e'.charCodeAt(0)]);
        var line2 = new TestBufferLine(5, [1, 'a', 0, 'a'.charCodeAt(0)], true);
        line2.copyFrom(line);
        chai.expect(line2.toArray()).eql(line.toArray());
        chai.expect(line2.length).equals(line.length);
        chai.expect(line2.isWrapped).equals(line.isWrapped);
    });
    it('should support combining chars', function () {
        var line = new TestBufferLine(2, [1, 'e\u0301', 0, '\u0301'.charCodeAt(0)]);
        chai.expect(line.toArray()).eql([[1, 'e\u0301', 0, '\u0301'.charCodeAt(0)], [1, 'e\u0301', 0, '\u0301'.charCodeAt(0)]]);
        var line2 = new TestBufferLine(5, [1, 'a', 0, '\u0301'.charCodeAt(0)], true);
        line2.copyFrom(line);
        chai.expect(line2.toArray()).eql(line.toArray());
        var line3 = line.clone();
        chai.expect(TestBufferLine.prototype.toArray.apply(line3)).eql(line.toArray());
    });
    describe('resize', function () {
        it('enlarge(false)', function () {
            var line = new TestBufferLine(5, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            line.resize(10, [1, 'a', 0, 'a'.charCodeAt(0)]);
            chai.expect(line.toArray()).eql(Array(10).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
        });
        it('enlarge(true)', function () {
            var line = new TestBufferLine(5, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            line.resize(10, [1, 'a', 0, 'a'.charCodeAt(0)], true);
            chai.expect(line.toArray()).eql(Array(10).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
        });
        it('shrink(true) - should apply new size', function () {
            var line = new TestBufferLine(10, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            line.resize(5, [1, 'a', 0, 'a'.charCodeAt(0)], true);
            chai.expect(line.toArray()).eql(Array(5).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
        });
        it('shrink(false) - should not apply new size', function () {
            var line = new TestBufferLine(10, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            line.resize(5, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            chai.expect(line.toArray()).eql(Array(10).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
        });
        it('shrink(false) + shrink(false) - should not apply new size', function () {
            var line = new TestBufferLine(20, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            line.resize(10, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            line.resize(5, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            chai.expect(line.toArray()).eql(Array(20).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
        });
        it('shrink(false) + enlarge(false) to smaller than before', function () {
            var line = new TestBufferLine(20, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            line.resize(10, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            line.resize(15, [1, 'a', 0, 'a'.charCodeAt(0)]);
            chai.expect(line.toArray()).eql(Array(20).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
        });
        it('shrink(false) + enlarge(false) to bigger than before', function () {
            var line = new TestBufferLine(20, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            line.resize(10, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            line.resize(25, [1, 'a', 0, 'a'.charCodeAt(0)]);
            chai.expect(line.toArray()).eql(Array(25).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
        });
        it('shrink(false) + resize shrink=true should enforce shrinking', function () {
            var line = new TestBufferLine(20, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            line.resize(10, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            line.resize(10, [1, 'a', 0, 'a'.charCodeAt(0)], true);
            chai.expect(line.toArray()).eql(Array(10).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
        });
        it('enlarge from 0 length', function () {
            var line = new TestBufferLine(0, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            line.resize(10, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            chai.expect(line.toArray()).eql(Array(10).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
        });
        it('shrink to 0 length', function () {
            var line = new TestBufferLine(10, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            line.resize(0, [1, 'a', 0, 'a'.charCodeAt(0)], true);
            chai.expect(line.toArray()).eql(Array(0).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
        });
        it('shrink(false) to 0 and enlarge to different sizes', function () {
            var line = new TestBufferLine(10, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            line.resize(0, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            chai.expect(line.toArray()).eql(Array(10).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
            line.resize(5, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            chai.expect(line.toArray()).eql(Array(10).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
            line.resize(7, [1, 'a', 0, 'a'.charCodeAt(0)], false);
            chai.expect(line.toArray()).eql(Array(10).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
            line.resize(7, [1, 'a', 0, 'a'.charCodeAt(0)], true);
            chai.expect(line.toArray()).eql(Array(7).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
        });
    });
});
//# sourceMappingURL=BufferLine.test.js.map
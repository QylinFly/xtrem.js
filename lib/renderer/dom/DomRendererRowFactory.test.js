"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsdom = require("jsdom");
var chai_1 = require("chai");
var DomRendererRowFactory_1 = require("./DomRendererRowFactory");
var Buffer_1 = require("../../Buffer");
var BufferLine_1 = require("../../BufferLine");
var Types_1 = require("../atlas/Types");
describe('DomRendererRowFactory', function () {
    var dom;
    var rowFactory;
    var lineData;
    beforeEach(function () {
        dom = new jsdom.JSDOM('');
        rowFactory = new DomRendererRowFactory_1.DomRendererRowFactory(dom.window.document);
        lineData = createEmptyLineData(2);
    });
    describe('createRow', function () {
        it('should not create anything for an empty row', function () {
            var fragment = rowFactory.createRow(lineData, false, undefined, 0, 5, 20);
            chai_1.assert.equal(getFragmentHtml(fragment), '');
        });
        it('should set correct attributes for double width characters', function () {
            lineData.set(0, [Buffer_1.DEFAULT_ATTR, '語', 2, '語'.charCodeAt(0)]);
            lineData.set(1, [Buffer_1.DEFAULT_ATTR, '', 0, undefined]);
            var fragment = rowFactory.createRow(lineData, false, undefined, 0, 5, 20);
            chai_1.assert.equal(getFragmentHtml(fragment), '<span style="width: 10px;">語</span>');
        });
        it('should add class for cursor and cursor style', function () {
            for (var _i = 0, _a = ['block', 'bar', 'underline']; _i < _a.length; _i++) {
                var style = _a[_i];
                var fragment = rowFactory.createRow(lineData, true, style, 0, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), "<span class=\"xterm-cursor xterm-cursor-" + style + "\"> </span>");
            }
        });
        it('should not render cells that go beyond the terminal\'s columns', function () {
            lineData.set(0, [Buffer_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]);
            lineData.set(1, [Buffer_1.DEFAULT_ATTR, 'b', 1, 'b'.charCodeAt(0)]);
            var fragment = rowFactory.createRow(lineData, false, undefined, 0, 5, 1);
            chai_1.assert.equal(getFragmentHtml(fragment), '<span>a</span>');
        });
        describe('attributes', function () {
            it('should add class for bold', function () {
                lineData.set(0, [Buffer_1.DEFAULT_ATTR | (1 << 18), 'a', 1, 'a'.charCodeAt(0)]);
                var fragment = rowFactory.createRow(lineData, false, undefined, 0, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-bold">a</span>');
            });
            it('should add class for italic', function () {
                lineData.set(0, [Buffer_1.DEFAULT_ATTR | (64 << 18), 'a', 1, 'a'.charCodeAt(0)]);
                var fragment = rowFactory.createRow(lineData, false, undefined, 0, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-italic">a</span>');
            });
            it('should add classes for 256 foreground colors', function () {
                var defaultAttrNoFgColor = (0 << 9) | (Types_1.DEFAULT_COLOR << 0);
                for (var i = 0; i < 256; i++) {
                    lineData.set(0, [defaultAttrNoFgColor | (i << 9), 'a', 1, 'a'.charCodeAt(0)]);
                    var fragment = rowFactory.createRow(lineData, false, undefined, 0, 5, 20);
                    chai_1.assert.equal(getFragmentHtml(fragment), "<span class=\"xterm-fg-" + i + "\">a</span>");
                }
            });
            it('should add classes for 256 background colors', function () {
                var defaultAttrNoBgColor = (Buffer_1.DEFAULT_ATTR << 9) | (0 << 0);
                for (var i = 0; i < 256; i++) {
                    lineData.set(0, [defaultAttrNoBgColor | (i << 0), 'a', 1, 'a'.charCodeAt(0)]);
                    var fragment = rowFactory.createRow(lineData, false, undefined, 0, 5, 20);
                    chai_1.assert.equal(getFragmentHtml(fragment), "<span class=\"xterm-bg-" + i + "\">a</span>");
                }
            });
            it('should correctly invert colors', function () {
                lineData.set(0, [(8 << 18) | (2 << 9) | (1 << 0), 'a', 1, 'a'.charCodeAt(0)]);
                var fragment = rowFactory.createRow(lineData, false, undefined, 0, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-fg-1 xterm-bg-2">a</span>');
            });
            it('should correctly invert default fg color', function () {
                lineData.set(0, [(8 << 18) | (Buffer_1.DEFAULT_ATTR << 9) | (1 << 0), 'a', 1, 'a'.charCodeAt(0)]);
                var fragment = rowFactory.createRow(lineData, false, undefined, 0, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-fg-1 xterm-bg-257">a</span>');
            });
            it('should correctly invert default bg color', function () {
                lineData.set(0, [(8 << 18) | (1 << 9) | (Types_1.DEFAULT_COLOR << 0), 'a', 1, 'a'.charCodeAt(0)]);
                var fragment = rowFactory.createRow(lineData, false, undefined, 0, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-fg-257 xterm-bg-1">a</span>');
            });
            it('should turn bold fg text bright', function () {
                for (var i = 0; i < 8; i++) {
                    lineData.set(0, [(1 << 18) | (i << 9) | (Types_1.DEFAULT_COLOR << 0), 'a', 1, 'a'.charCodeAt(0)]);
                    var fragment = rowFactory.createRow(lineData, false, undefined, 0, 5, 20);
                    chai_1.assert.equal(getFragmentHtml(fragment), "<span class=\"xterm-bold xterm-fg-" + (i + 8) + "\">a</span>");
                }
            });
        });
    });
    function getFragmentHtml(fragment) {
        var element = dom.window.document.createElement('div');
        element.appendChild(fragment);
        return element.innerHTML;
    }
    function createEmptyLineData(cols) {
        var lineData = new BufferLine_1.BufferLine(cols);
        for (var i = 0; i < cols; i++) {
            lineData.set(i, [Buffer_1.DEFAULT_ATTR, Buffer_1.NULL_CELL_CHAR, Buffer_1.NULL_CELL_WIDTH, Buffer_1.NULL_CELL_CODE]);
        }
        return lineData;
    }
});
//# sourceMappingURL=DomRendererRowFactory.test.js.map
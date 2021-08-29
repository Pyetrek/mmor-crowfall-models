import assert from "assert";
import { Rectangle, Point, Line } from '../js/shapes.js';

describe('shapes', function() {
    describe('Line', function() {
        [
            [new Line([new Point(1, 1), new Point(3, 1)]), new Line([new Point(2, 0), new Point(2, 2)]), true],
            [new Line([new Point(1, 1), new Point(3, 1)]), new Line([new Point(1, 2), new Point(3, 2)]), false],
            [new Line([new Point(1, 1), new Point(1, 3)]), new Line([new Point(2, 1), new Point(2, 3)]), false],
            [new Line([new Point(1, 1), new Point(3, 1)]), new Line([new Point(4, 1), new Point(4, 3)]), false],
            [new Line([new Point(4, 5), new Point(2, 5)]), new Line([new Point(3, 4), new Point(3, 6)]), true],
        ].forEach((data, index) => {
            it('intersects #' + index, function() {
                assert.equal(data[0].intersects(data[1]), data[2]);
                assert.equal(data[1].intersects(data[0]), data[2]);
            });
        });
    });

    describe('Rectangle', function() {
        [
            [new Rectangle(1, 1, 2, 2), new Rectangle(1, 1, 2, 2), true],
            [new Rectangle(1, 1, 4, 4), new Rectangle(2, 2, 1, 1), true],
            [new Rectangle(1, 1, 1, 1), new Rectangle(4, 4, 1, 1), false],
            [new Rectangle(1, 1, 2, 2), new Rectangle(2, 2, 2, 2), true],
            [new Rectangle(1, 4, 2, 2), new Rectangle(2, 3, 2, 2), true],
            [new Rectangle(1, 2, 3, 1), new Rectangle(2, 1, 1, 3), true],
            [new Rectangle(1, 1, 1, 1), new Rectangle(1, 3, 1, 1), false],
            [new Rectangle(1, 1, 1, 1), new Rectangle(3, 3, 1, 1), false],
        ].forEach((data, index) => {
            it('overlap #' + index, function() {
                assert.equal(data[0].overlaps(data[1]), data[2]);
                assert.equal(data[1].overlaps(data[0]), data[2]);
            });
        });

        [
            [new Rectangle(1, 1, 2, 2), new Point(0, 0), false],
            [new Rectangle(1, 1, 2, 2), new Point(0, 2), false],
            [new Rectangle(1, 1, 2, 2), new Point(0, 4), false],
            [new Rectangle(1, 1, 2, 2), new Point(2, 0), false],
            [new Rectangle(1, 1, 2, 2), new Point(2, 2), true],
            [new Rectangle(1, 1, 2, 2), new Point(2, 4), false],
            [new Rectangle(1, 1, 2, 2), new Point(4, 0), false],
            [new Rectangle(1, 1, 2, 2), new Point(4, 2), false],
            [new Rectangle(1, 1, 2, 2), new Point(4, 4), false],
            [new Rectangle(1, 1, 2, 2), new Point(1, 1), true],
        ].forEach((data, index) => {
            it('contains #' + index, function() {
                assert.equal(data[0].contains(data[1]), data[2]);
            });
        })
    });
});

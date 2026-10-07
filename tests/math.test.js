import test from 'node:test';
import assert from 'node:assert/strict';
import { grains, scientific, hotelRoom, rationalSequence } from '../src/math.js';
test('棋盘边界和 64 格精确整数', () => {
  assert.deepEqual(grains(1), {current: 1n, total: 1n});
  assert.equal(grains(64).total, 18446744073709551615n);
  assert.equal(grains(64).current, 9223372036854775808n);
  assert.throws(() => grains(0), RangeError);
  assert.throws(() => grains(1.5), RangeError);
});
test('科学计数的边界', () => {
  assert.equal(scientific(0), 1n);
  assert.equal(scientific(12), 1000000000000n);
});
test('旅馆映射保持一对一并留出房间', () => {
  for (const mode of ['one', 'many']) {
    const rooms = Array.from({length: 100}, (_, i) => hotelRoom(i + 1, mode));
    assert.equal(new Set(rooms).size, 100);
    assert.ok(!rooms.includes(1));
    if (mode === 'many') assert.ok(rooms.every(room => room % 2 === 0));
  }
});
test('有理数枚举不重复并涵盖示例', () => {
  const seq = rationalSequence(100);
  assert.equal(new Set(seq.map(pair => pair.join('/'))).size, 100);
  assert.ok(seq.some(([a,b]) => a === 3 && b === 7));
  assert.deepEqual(seq.slice(0,3), [[1,1],[1,2],[2,1]]);
});

const assert = require('assert');
const mocha = require('mocha');

const { snakeCase } = require('..');

function test(f) {
  mocha.it(f.name, f);
}

test(function should_return_same_string_without_spaces() {
  const actual = snakeCase('hello')
  const expected = 'hello';
  assert.strictEqual(actual, expected);  
});

test(function should_replace_space_with_underscore() {
  const actual = snakeCase('hello world');
  const expected = 'hello_world';
  assert.strictEqual(actual, expected);
});

test(function should_replace_multiple_spaces_with_underscores() {
  const actual = snakeCase('i   love to write tests');
  const expected = 'i___love_to_write_tests';
  assert.strictEqual(actual, expected);
});

test(function should_replace_tab_with_underscore() {
  const actual = snakeCase('hollywood\tbowl');
  const expected = 'hollywood_bowl';
  assert.strictEqual(actual, expected);
});

test(function should_replace_multiple_tabs_with_underscores() {
  const actual = snakeCase('eat\tice\tcream');
  const expected = 'eat_ice_cream';
  assert.strictEqual(actual, expected);
});

test(function should_remove_special_characters() {
  const actual = snakeCase('wowzers!@#$%^&*()+=-{}][;\'":.,></?\\');
  const expected = 'wowzers';
  assert.strictEqual(actual, expected);
});

test(function should_not_remove_underscores() {
  const actual = snakeCase('under_score');
  const expected = 'under_score';
  assert.strictEqual(actual, expected);
});

test(function should_lowercase_characters() {
  const actual = snakeCase('this is a LOVely slice of CAKE');
  const expected = 'this_is_a_lovely_slice_of_cake';
  assert.strictEqual(actual, expected);
})

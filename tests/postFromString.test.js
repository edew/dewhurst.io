const assert = require('assert');
const mocha = require('mocha');

const { postFromString } = require('..');

function test(f) {
  mocha.it(f.name, f);
}

test(function should_create_post_with_title_and_path() {
  const actual = postFromString('# I love to write useless software for fun');
  const expected = {
    title: 'I love to write useless software for fun',
    path: 'i_love_to_write_useless_software_for_fun',
    html: '<h1 id="i-love-to-write-useless-software-for-fun">I love to write useless software for fun</h1>\n'
  };

  assert.deepStrictEqual(actual, expected);
});

test(function should_create_post_with_title_path_and_one_paragraph() {
  const actual = postFromString('# I love to write useless\n\nsoftware for fun');
  const expected = {
    title: 'I love to write useless',
    path: 'i_love_to_write_useless',
    html: '<h1 id="i-love-to-write-useless">I love to write useless</h1>\n<p>software for fun</p>\n'
  };

  assert.deepStrictEqual(actual, expected);
});

test(function should_create_post_with_title_path_and_multiple_paragraphs() {
  const actual = postFromString('# I love to write useless\n\nsoftware for fun\n\ntake me to afternoon tea!');
  const expected = {
    title: 'I love to write useless',
    path: 'i_love_to_write_useless',
    html: '<h1 id="i-love-to-write-useless">I love to write useless</h1>\n<p>software for fun</p>\n<p>take me to afternoon tea!</p>\n'
  };

  assert.deepStrictEqual(actual, expected);
});

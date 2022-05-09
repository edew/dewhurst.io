const assert = require('assert');
const mocha = require('mocha');

const { postFromString } = require('..');

function test(f) {
  mocha.it(f.name, f);
}

test(function should_create_post_with_title_and_path() {
  const actual = postFromString('# I love to write useless software for fun', '1970-01-01T00:00:00.000Z');
  const expected = {
    title: 'I love to write useless software for fun',
    path: 'i_love_to_write_useless_software_for_fun',
    html: '<h1 id="i-love-to-write-useless-software-for-fun">I love to write useless software for fun</h1>\n',
    timestamp: 0,
    dateString: '1 January 1970',
  };

  assert.deepStrictEqual(actual, expected);
});

test(function should_create_post_with_title_path_and_one_paragraph() {
  const actual = postFromString('# I love to write useless\n\nsoftware for fun', '1970-01-01T00:00:00.000Z');
  const expected = {
    title: 'I love to write useless',
    path: 'i_love_to_write_useless',
    html: '<h1 id="i-love-to-write-useless">I love to write useless</h1>\n<p>software for fun</p>\n',
    timestamp: 0,
    dateString: '1 January 1970',
  };

  assert.deepStrictEqual(actual, expected);
});

test(function should_create_post_with_title_path_and_multiple_paragraphs() {
  const actual = postFromString('# I love to write useless\n\nsoftware for fun\n\ntake me to afternoon tea!', '1970-01-01T00:00:00.000Z');
  const expected = {
    title: 'I love to write useless',
    path: 'i_love_to_write_useless',
    html: '<h1 id="i-love-to-write-useless">I love to write useless</h1>\n<p>software for fun</p>\n<p>take me to afternoon tea!</p>\n',
    timestamp: 0,
    dateString: '1 January 1970',
  };

  assert.deepStrictEqual(actual, expected);
});

test(function should_create_a_post_with_timestamp_and_datestring() {
  const actual = postFromString('# wow', '2022-04-28T22:27:46+01:00');
  const expected = {
    title: 'wow',
    path: 'wow',
    html: '<h1 id="wow">wow</h1>\n',
    timestamp: 1651181266000,
    dateString: '28 April 2022',
  };

  assert.deepStrictEqual(actual, expected);
});

const os = require('os');
const assert = require('assert');
const mocha = require('mocha');

const { postFromString } = require('..');

function test(f) {
  mocha.it(f.name, f);
}

function unindent(string) {
  const unindentedLines = string.split(os.EOL).map(line => line.replace(/^\s+/, ''))
  
  if (unindentedLines[0] === '') {
    unindentedLines.splice(0, 1);
  }
  
  return unindentedLines.join(os.EOL);
}

test(function should_create_post_with_title_and_path() {
  const actual = postFromString(unindent(`
    ---
    date: ${new Date(0).toISOString()}
    ---
    # I love to write useless software for fun`
  ));
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
  const actual = postFromString(unindent(`
    ---
    date: ${new Date(0).toISOString()}
    ---
    # I love to write useless

    software for fun
  `));
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
  const actual = postFromString(unindent(`
    ---
    date: ${new Date(0).toISOString()}
    ---
    # I love to write useless

    software for fun


    take me to afternoon tea!
  `));
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
  const actual = postFromString(unindent(`
    ---
    date: ${new Date(Date.UTC(2022, 03, 28)).toISOString()}
    ---
    # wow
  `));
  const expected = {
    title: 'wow',
    path: 'wow',
    html: '<h1 id="wow">wow</h1>\n',
    timestamp: 1651104000000,
    dateString: '28 April 2022',
  };

  assert.deepStrictEqual(actual, expected);
});

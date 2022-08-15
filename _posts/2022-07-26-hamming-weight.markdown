---
layout: post
title:  "Hamming Weight"
date:   2022-07-26 00:51:24 +0100
---
How can we count how many 1s there are in a binary number?

<pre>
<code>const hammingWeight = (num) => {
  let count = 0;
  while (num > 0) {
    num &= num - 1;
    count += 1;
  }
  return count;
}
</code>
</pre>

<img alt="A chart showing the hamming weight of the first 100 natural numbers" src="/assets/img/hamming-weight-first-100-natural-numbers.png" />

<p style="text-align: center"> 
A chart showing the hamming weight of the first 100 natural numbers. 
</p>
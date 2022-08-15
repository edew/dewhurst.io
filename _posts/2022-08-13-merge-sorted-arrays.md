---
layout: post
title:  "Merge Sorted Arrays"
date:   2022-08-13 20:06:00 +0100
---

How can we merge two sorted arrays?

<pre>
<code>const merge = (a, b) => {
  const resultLength = a.length + b.length;
  const result = new Array(resultLength);
  let aIndex = 0;
  let bIndex = 0;
  let resultIndex = 0;
  
  while (resultIndex < resultLength) {
    if (bIndex >= b.length || a[aIndex] <= b[bIndex]) {
      result[resultIndex++] = a[aIndex++];
    } else {
      result[resultIndex++] = b[bIndex++];
    }
  }
  
  return result;
}
</code>
</pre>
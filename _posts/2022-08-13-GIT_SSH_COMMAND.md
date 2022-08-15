---
layout: post
title:  "GIT_SSH_COMMAND"
date:   2022-08-13 16:24:00 +0100
---

Last week I used Git's GIT_SSH_COMMAND environment variable to force the a command running in a CircleCI job to use one of CircleCI's  "Additional SSH Keys" instead of the "deploy key".

1. Add an "Additional SSH Key" to CircleCI. Take note of its fingerprint.
2. Use the special "add_ssh_keys" special step in your CircleCI configuration to add the SSH key to your job. This step will add a file named "id_rsa_FINGERPRINT".
3. Set the GIT_SSH_COMMAND to force git to use your desired key:

<pre>
<code>environment:
  GIT_SSH_COMMAND: "ssh -i /home/circleci/.ssh/id_rsa_FINGERPRINT -o UserKnownHostsFile=/home/circleci/.ssh/known_hosts"
</code>
</pre>
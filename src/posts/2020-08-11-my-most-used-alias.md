---
title: My most used alias
description: A bash alias for disk usage
date: 2020-08-11 00:16:13
tags:
  - posts
  - terminal
  - alias
  - disk
---

I often deal with full hard drives over SSH.
And surprisingly, it's tricky to get a good number for disk usage,
without installing any third party packages.

But here it is, my most *used* alias:

```bash
alias used='du -sch .[!.]* * 2>/dev/null | sort -h'
```

Put it in the `~/.bashrc` or similar profile file.

## Example output

![Example output of the alias](/assets/images/posts/used-alias.png){.w-full}

*P.s.* The title of the article was not originally intended to be a pun.
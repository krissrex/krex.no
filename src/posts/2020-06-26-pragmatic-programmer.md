---
title: 'Pragmatic programmer console tips'
description: Pragmatic programmer console tips
date: 2020-06-26 10:37:00
tags: 
  - posts
  - pragmatic programmer
  - terminal
---

<p>
  <img class="w-full" src="/assets/images/post/pragmatic-tips.png" alt="Preview of pragmatic console tips">
</p>

Install the following software: `jq`.  
Download [pragmatic-tips.json](/assets/downloads/post/pragmatic-tips.json) and
place it somewhere your console can read it.

Place the following code in
`/etc/profile.d/pragmatic-tips.sh`:

```bash
#!/bin/bash

function _pragmatic_tip() {
  local TIPS="/c/Dev/Tools/pragmatic-tips.json"

  if [ -f "$TIPS" ] && [ "$(command -v jq)" != "" ]; then
    local TIP_SIZE=100
    local INDEX=$(( RANDOM % TIP_SIZE ))
    local TIP=$(jq -c ".[$INDEX]" "$TIPS")

    local INDENT="  "
    local NUMBER=$(echo $TIP | jq -r '.number')
    local TITLE=$(echo $TIP | jq -r '.title')
    local TEXT=$(echo $TIP | jq -r '.text' | fold -w 50 --spaces | sed "s/^/$INDENT/g")

    printf "$INDENT\e[90m$NUMBER$INDENT\e[38;5;213m$TITLE\n\e[38;5;198m$TEXT\e[39m"
  fi
}

_pragmatic_tip
```

## Scraping the tips

I used the following script on <a
                                    href="https://pragprog.com/tips/">https://pragprog.com/tips/</a>
website:

```js
x = [...document.querySelector('.tpp_tips_container').children].map(child =>
    ({
        number: child.querySelector(".tip-number").innerText,
        title: child.querySelector(".tip-title").innerText,
        text: child.querySelector(".tip-body").innerText
    }));

JSON.stringify(x, null, 4);
```
Then saved that json to a file.

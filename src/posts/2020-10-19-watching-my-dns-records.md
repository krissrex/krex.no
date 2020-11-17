---
title: Watching my DNS records
description: A script to email me if my public IP and DNS do not match.
date: 2020-10-19 16:56:48
tags:
  - posts
  - dns
  - ip
  - monitoring
  - sysadmin
---

> **Update 17th Oct:** I forced `curl` to use IPv4, as I sometimes got IPv6 back.
> And I added `Date` and `Message-ID` headers to email, as this reduces the SpamAssassin score ([I tested with this](https://dkimvalidator.com/)). 

Home routers and ISPs are not always the best for hosting a website.
One reason in particular, is the lack of static IP-addresses.
So whenever my router restarts, I risk getting a new IP.
Which in turn means the DNS records for this site (krex.no) become invalid!
I could enable [ddns](https://en.wikipedia.org/wiki/Dynamic_DNS), but my router is behind NAT.
(Yes, double NAT is bad, but I will clean that up at a later time).

So to fix this, I wanted to know when my IP has changed.
And when it does, I want to get an email. Later on, I can update the DNS records automatically.
My registrar has both and [API](https://api.domeneshop.no/docs/#section/Overview) and [API clients](https://github.com/domeneshop/domeneshop.js) available.
But for now, I just want to *know*. The automatic DNS record updates can be dealt with later, when I get tired of manually updating them.

## Sub-problems

Our problem has 3 parts:
* What IP does the DNS say we have?
* What IP do we actually have? (The *dynamic*, public IP)
* How do we email ourselves?

## The scripts

So first off, SSH into the server and create a folder: `ip-watch`.

### Getting our IP

A [guy at cloudflare](https://github.com/xxdesmus) made [canhazip.com](https://canhazip.com) to easily get your ip.
Put this into `current-ip.sh`:

```bash
#!/bin/bash
curl --silent -4 canhazip.com
```

The `-4` tells curl to use IPv4.
Other alternatives:

```
dig +short TXT o-o.myaddr.l.google.com @ns3.google.com
nslookup myip.opendns.com resolver1.opendns.com
```

However they might require some `grep`ing.

### Getting the DNS ip

Some like `dig`, some like `nslookup`, but neither are pre-installed on my raspberry pi.
Instead, we opt for `getent hosts`.
Put this into `current-dns.sh`:

```bash
#!/bin/bash

getent hosts krex.no | awk '{ print $1 }'
```

### Sending the emails

I already set up postfix in docker using [boky/postfix](https://hub.docker.com/r/boky/postfix)
with [some tweaks](https://github.com/bokysan/docker-postfix/issues/30) to make it run on a 32bit os.
This adds a SMTP server on my localhost on port 25 and 587 (TLS).
When I send email through this server, it can use OpenDKIM when sending the email,
and this avoid some spam filters such as gmail's. [Here is my signature](https://mxtoolbox.com/SuperTool.aspx?action=dkim%3akrex.no%3amail&run=toolpage).

To stitch the scripts together, I intend to make another script.
So the DNS IP and current IP are sent from the command line.
Put this in `email-warning.py`:

```python
#!/usr/bin/env python3

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import email.utils
from datetime import datetime
from sys import argv

def send_email(dns_ip, current_ip):
    with smtplib.SMTP(host='localhost', port=587) as s:
        msg = MIMEMultipart()
        body = f"DNS has ip {dns_ip}\nThe current ip is {current_ip}\n\nSent at {datetime.now()}."
        msg["From"] = "DNS IP Watcher <noreply@krex.no>"
        msg["To"] = "INSERT-YOUR-EMAIL-HERE@email.com" # Change this line
        msg["Subject"] = "[krex.no] DNS is invalid " + str(datetime.now())
        msg["Date"] = email.utils.formatdate(localtime=True)
        msg["Message-ID"] = email.utils.make_msgid(domain="krex.no")
        msg.attach(MIMEText(body, 'plain'))

        s.send_message(msg)
        print("Sent message '%s' to %s. Message-ID: %s" % (msg["Subject"], msg["To"], msg["Message-ID"]))

def main():
    if len(argv) != 3:
        print(f"Usage: {argv[0]} dns_ip current_ip")
        exit(1)

    dns_ip = argv[1]
    current_ip = argv[2]
    if dns_ip != current_ip:
        send_email(dns_ip, current_ip)

if __name__ == '__main__':
    main()

```

### The final glue

The script which we will run with `cron` is called `do-check.sh`:

```bash
#!/bin/bash

DNS=$(./current-dns.sh)
IP=$(./current-ip.sh)

echo "Current DNS: $DNS"
echo "Current IP: $IP"

exec ./email-warning.py $DNS $IP
```

Don't forget to make the files executable:

```bash
chmod +x *.sh *.py
```

## Running it daily

`cron` has been mentioned already, and is perfect for this.
Run `crontab -e` to edit the file, and add a new line:

```
# DNS/IP test every day at 13:00
0 13 * * * /home/pi/dev/ip-watch/do-check.sh
```

+++
title = "Reading serial data from an ESP32 without dropping frames"
date = 2026-07-17T20:15:00+06:00
draft = false
summary = "The reader was fine. The buffer was fine. The problem was that I was reading line-by-line from a device that doesn't send lines."
tags = ["esp32", "python", "debugging"]
featured = true
+++

Second sample entry — delete this one too. It's here so the landing page has
more than one card and you can see how the log stacks up.

## What broke

Every few seconds a packet went missing. Nothing in the logs, no exception,
just gaps in the plot.

## What I tried

- Bigger read buffer. No change.
- Slower baud rate. Fewer drops, but still drops.
- Timestamping on the device instead of the host. This is what showed the problem.

## What it was

`readline()` blocks until it sees `\n`. The firmware was sending fixed-width
binary frames with no delimiter, so any byte that happened to be `0x0A` split a
frame in half and the halves got discarded as malformed.

Switched to reading a fixed number of bytes and syncing on a magic header:

```python
HEADER = b"\xAA\x55"

def read_frame(port, size=32):
    while port.read(1) != HEADER[:1]:
        pass
    if port.read(1) != HEADER[1:]:
        return None
    return port.read(size)
```

Zero drops over an hour.

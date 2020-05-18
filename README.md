# node-switchable-fs

A typescript filesystem offering a unified API over any kind of concrete adapter implementation.

## Existing adapters

Currently only two adapters are working and tested:
- Local adapter which makes use of `fs` under the hood
- InMemory which stores everything in a tree data structure in memory
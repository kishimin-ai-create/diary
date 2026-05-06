# Test Rules

- Classical

We call them “Small”, “Medium” and “Large” tests. They differ like so: | Feature
| Small | Medium | Large | | -------------------- | ----- | -------------- |
----- | | Network access | No | localhost only | Yes | | Database | No | Yes |
Yes | | File system access | No | Yes | Yes | | Use external systems | No |
Discouraged | Yes | | Multiple threads | No | Yes | Yes | | Sleep statements |
No | Yes | Yes | | System properties | No | Yes | Yes | | Time limit (seconds) |
60 | 300 | 900+ |

- You should have more Medium tests than Large tests, and more Small tests than
  Medium tests.

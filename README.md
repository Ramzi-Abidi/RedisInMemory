[![progress-banner](https://backend.codecrafters.io/progress/redis/df7cf856-106d-4db7-b274-2e6f066b2d9c)](https://app.codecrafters.io/users/codecrafters-bot?r=2qF)

This is a starting point for JavaScript solutions to the
["Build Your Own Redis" Challenge](https://codecrafters.io/challenges/redis).

In this challenge, you'll build a toy Redis clone that's capable of handling
basic commands like `PING`, `SET` and `GET`. Along the way we'll learn about
event loops, the Redis protocol and more.

# RESP

Bulk strings
A bulk string represents a single binary string. The string can be of any size, but by default, Redis limits it to 512 MB (see the proto-max-bulk-len configuration directive).

RESP encodes bulk strings in the following way:

$<length>\r\n<data>\r\n

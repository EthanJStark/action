# @neezer/action

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Action is a value object representing an event. It is modelled closely after
[FSA](https://github.com/redux-utilities/flux-standard-action) and comes with
some additional behavior.

- Action is a rich object, with an associated Meta
- Actions can be merged together to create aggregate actions
- Actions carry a history of where they've been and how they've evolved,
  creating a human-readable narrative of their lifecycle
- Actions can be ground together via an arbitrary correlaion id as well as by an
  arbitrary connection id
- Actions can be serialized to JSON and will strip out internal properties
  before doing so

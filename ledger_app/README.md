# Ledger API (round 2 audit target)

An invoicing and file-sharing API. Unlike `sample_app/`, the defects here are
the kind that survive human review: authorisation gaps, unsafe path and URL
handling, prototype pollution, timing leaks. It also contains **decoys**,
code that looks dangerous but is safe, so false positives are measured, not
just misses.

The answer key is `../audit/hard/ground_truth.json`. Bob is told not to read it.

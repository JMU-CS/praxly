# Praxly

Praxly is an web-based IDE that empowers users to read, write, and run the pseudocode used in the [CS Praxis Test][1].
Praxly supports bidirectional synchronization between both block-based and text-based editors, allowing users to learn and visualize the code while also offering the efficiency of editing text.
The text editor uses [Ace][2], and the block editor uses [Blockly][3].

[1]: https://www.ets.org/pdfs/praxis/5652.pdf#page=21
[2]: https://ace.c9.io/
[3]: https://developers.google.com/blockly

<figure>
    <img src="public/images/praxly-screenshot-narrow.png">
    <figcaption>Screenshot of Praxly running a recursive factorial function</figcaption>
</figure>


## Development

Install dependencies:
```
$ npm install
```

To run locally:
```
$ npm run dev
```

## Unit Testing

Install dependencies:
```
$ pip install colorama selenium
```

To run locally:
```
$ python runall.py [CSV_FILE]
```

## Deployment

Note: This process is automated via GitHub actions.

To build for production:
```
PRAXLY_PATH=/relative/path/on/server npm run build
```

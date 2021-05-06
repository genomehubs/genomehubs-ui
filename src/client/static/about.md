# About

This is a temporary file to test markdown file processing

- [external links](https://genomehubs.org)
- use directives for :span[direct]{.direct}, :span[descendant]{.descendant} and :span[ancestor]{.ancestor}

## Tooltips

:tooltip[:span[Even use tooltips]{.direct}]{title="directly measured value!" arrow placement="right"}
alongside ordinary text

## Grid layout

:::grid{container direction="row" spacing="1" style="margin-top:1em;padding:0.2em;border:solid pink 1em"}
::grid[:span[levels:]]{item xs=2}
::grid[:span[direct]{.direct}]{item xs=1 style="background-color:yellow"}
::grid[:span[descendant]{.descendant}]{item xs=3}
::grid[:span[ancestor]{.ancestor}]{item xs=6}
:::

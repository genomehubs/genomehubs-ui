# Nested

Also supports nested markdown, e.g. to place complex markdown in a grid:

```json
{
  "key": "value"
}
```

:::grid{container direction="row" spacing="1"}

::grid[![browse](/static/about/browse.png) GoaT picture]{item xs=5}

::grid[![browse](/static/about/browse.png) :span[GoaT picture]{.caption}]{item xs=7}

::item{item xs=3}

:::

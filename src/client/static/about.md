# About :hub

:hub (Genomes on a Tree) is built using GenomeHubs 2.0, to present metadata including genome sizes, C values, and chromosome numbers for all taxa across the tree of life.

## Data summary

:::grid{container direction="row"}

::item[![GoaT](/static/about/browse.png)]{xs=4}

::report{report="histogram" x="assembly_span" result="taxon" cat="order" rank="genus" item xs="6" ratio=1.5}

:::

:::grid{container direction="row"}

:::

The values in this GenomeHub are shown alongside a color-coding system to indicate which are based on :span[direct]{.direct} measurements, which are inferred from :span[descendant]{.descendant} taxa and which are inferred from sibling taxa via a shared :span[ancestor]{.ancestor}. For this last category, tooltips provide details of the common ancestral rank to provide an indication of how reliable the estimate may be, e.g. :tooltip[:span[ancestor]{.ancestor}]{title="family" arrow placement="right"}.

## Data sources

The data in this GenomeHub have been collated from the following sources:

::report{report="sources"}

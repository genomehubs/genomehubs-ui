# About :hub

:hub (Genomes on a Tree) is built using GenomeHubs 2.0, to present metadata including genome sizes, C values, and chromosome numbers for all taxa across the tree of life.

## How to use GoaT

In the search box above try typing: 

Chiroptera

## Data summary

:::grid{container direction="row"}

::report{report="xInY" x="c_value" rank="species,genus,family" item xs=4}

::report{report="xPerRank" item xs=4 }

::report{delay=500 report="xInY" x="assembly_span" rank="species" item xs=4}

:::

:::grid{container direction="row" spacing="1"}

::report{report="xInY" x="assembly_level=chromosome" y="assembly_span" rank="species" item xs=4}

::report{report="histogram" x="genome_size" rank="family" cat="kingdom" stacked="true" ratio=2 item xs=8}

:::

The values in this GenomeHub are shown alongside a color-coding system to indicate which are based on :span[direct]{.direct} measurements, which are inferred from :span[descendant]{.descendant} taxa and which are inferred from sibling taxa via a shared :span[ancestor]{.ancestor}. For this last category, tooltips provide details of the common ancestral rank to provide an indication of how reliable the estimate may be, e.g. :tooltip[:span[ancestor]{.ancestor}]{title="family" arrow placement="right"}.

---

## Data sources

The data in :hub have been collated from the following sources:

::report{report="sources"}

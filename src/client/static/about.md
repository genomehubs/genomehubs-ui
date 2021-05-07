# About

GoaT (Genomes on a Tree) is built using GenomeHubs 2.0, to present metadata including genome sizes, C values, and chromosome numbers for all taxa across the tree of life.

## Data summary

:::grid{container direction="row" spacing="4"}
::report{report="xPerRank" item xs=5 heading="This GenomeHub contains data for:"}
::report{report="xPerRank" x="genome_size>1000000000" heading="Filtered by genome size" caption="have genome size > 1 Gb" item xs=4}
::report{report="xInY" x="assembly_span" rank="species" heading="Species with assemblies" item xs=3}
:::

:::grid{container direction="row" spacing="1"}
::grid{item xs="3"}
::report{report="xInY" x="assembly_level=chromosome" y="assembly_span" rank="species" heading="Assembled to chromosomes" item xs=6}
::grid{item xs="3"}

:::

The values in this GenomeHub are shown alongside a color-coding system to indicate which are based on :span[direct]{.direct} measurements, which are inferred from :span[descendant]{.descendant} taxa and which are inferred from sibling taxa via a shared :span[ancestor]{.ancestor}. For this last category, tooltips provide details of the common ancestral rank to provide an indication of how reliable the estimate may be, e.g. :tooltip[:span[ancestor]{.ancestor}]{title="family" arrow placement="right"}.

## Data sources

The data in this GenomeHub have been collated from the following sources:

::report{report="sources"}

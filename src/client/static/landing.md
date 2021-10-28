# About :hub

:hub (Genomes on a Tree) is built using GenomeHubs 2.0, to present metadata including genome sizes, C values, and chromosome numbers for all taxa across the tree of life.

:hub platform serves two main purposes:

- Serve as a centralized source of genome-relevant metadata for the global community and;
- Operate as the sequencing tracking system for the Earth Biogenome Project Network

## How to use GoaT

The easiest way to start exploring goat is to select your favorite taxon and play with the icons displayed under GoaTs search box.

You can use the "result columns" icon below the search box to select the metadata you would like to display for your search.

The drop down terms in the "query builder" icon can be also used to refine your search terms in your query.

## Example Steps

- [1] In the search box above try typing and selecting: Chiroptera

- [2] Click on the "result columns" icon

- [3] Deselect all boxes except "assembly"

- [4] In the "assembly"dropdown, select only assembly_span

- [5] Click the "Update" icon

# Explore taxa

Tap tree nodes to browse taxa or long-press to search:

:::grid{container direction=row}
::report{report="tree" x="tax_tree(Passeroidea) AND tax_depth(3) AND assembly_span" y="assembly_date>=2021" treeStyle="ring" taxonomy="ncbi" includeEstimates="true" ratio=1 disableModal="true" item xs=3}
::report{report="tree" x="tax_tree(Eukaryota) AND tax_depth(3)" treeStyle="rect" taxonomy="ncbi" includeEstimates="true" ratio=3 disableModal="true" item xs=9}

# Data summary

:::grid{container direction="row" spacing="1"}

::report{report="xInY" x="assembly_span" rank="phylum,class,order,family,genus,species" item xs=6}

::report{report="xPerRank" item xs=6 }

:::

:::grid{container direction="row" spacing="1"}

::report{report="xInY" x="chromosome_number>0" rank="Family" item xs=4}

::report{report="histogram" x="assembly_date" rank="species" cat="assembly_level" stacked="true" ratio=2 item xs=8}

:::

:::grid{container direction="row" spacing="1"}

::report{report="xInY" x="assembly_level=chromosome" y="assembly_span" rank="species" item xs=4}

::report{report="histogram" x="genome_size" rank="family" cat="kingdom" stacked="true" ratio=2 item xs=8}

:::

The values in this GenomeHub are shown alongside a color-coding system to indicate which are based on :span[direct]{.direct} measurements, which are inferred from :span[descendant]{.descendant} taxa and which are inferred from sibling taxa via a shared :span[ancestor]{.ancestor}. For this last category, tooltips provide details of the common ancestral rank to provide an indication of how reliable the estimate may be, e.g. :tooltip[:span[ancestor]{.ancestor}]{title="family" arrow placement="right"}.

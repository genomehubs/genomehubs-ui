# Earth Biogenome 2021

:::grid{container direction="column"}

::item[![GoaT](/static/images/EBG.png)]{xs=22}

:::

:::grid{container direction="row" spacing="1"}

::report{report="xInY" x="assembly_span" rank="phylum,class,order,family,genus,species" item xs=12}

:::

:::grid{container direction="row" spacing="1"}

::report{report="scatter" x="contig_n50" y="scaffold_n50" rank="species" cat="assembly_level" zScale="sqrt" xOpts="20,2000000000,17" yOpts="20,2000000000,17" scatterThreshold="10000" item xs=12}

:::

[back to projects](/projects)

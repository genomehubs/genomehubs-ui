import React, { useEffect } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import TextPanel from "./TextPanel";

const AboutPage = ({}) => {
  let text = (
    <TextPanel view={"about"}>
      <div>
        <p>
          GenomeHubs 2.0 is a set of lightweight tools for phylogenetically
          storing, querying, and sharing genomic data for all eukaryotes.
        </p>
        <p>
          Genomes on a Tree (GoaT) is the first of these tools, to present
          metadata for genome sizes (based on assemblies), C values, and
          chromosome numbers. We will be adding more metadata for each species
          in the next version, such as sequencing status, community interest (is
          someone sequencing that species, or planning to), sexual reproduction
          systems, etc.
        </p>
        <p>
          The current version of GoaT has a minimal feature set, aimed at
          helping Genome Sequencing/Assembly Teams to obtain accurate estimates
          for their species of interest
        </p>
        <p>Future releases will add fetures of use to:</p>
        <ul>
          <li>
            Genome Sequencing Consortia (such as{" "}
            <a className={styles.link} href="http://i5k.github.io">
              i5k
            </a>
            ,{" "}
            <a className={styles.link} href="https://www.earthbiogenome.org/">
              EBP
            </a>
            ,{" "}
            <a className={styles.link} href="https://www.darwintreeoflife.org">
              DTOL
            </a>
            ): to identify where sequencing efforts are currently focussed; to
            choose species that will have maximal impact in terms of covering
            diversity; to see which sequencing projects might be more tractable
            (e.g., if a species has varying ploidy levels, it might be better to
            first sequence a sister species with consistent ploidy)
          </li>
          <li>
            Comparative Genomicists: to answer genome evolution questions such
            as how are genome sizes and karyotypes correlated within and between
            specific clades
          </li>
        </ul>

        <p>
          We are funded by the Sanger{" "}
          <a
            className={styles.link}
            href="https://www.sanger.ac.uk/programme/tree-of-life/"
          >
            Tree of Life
          </a>{" "}
          programme.
        </p>
        <p>All our data will be FAIR, and all our tools will be open source.</p>
        <p>Team:</p>
        <ul>
          <li>Richard Challis (Lead)</li>
          <li>Sujai Kumar (Community Support)</li>
          <li>Mark Blaxter (Principal Investigator)</li>
        </ul>
        <p>
          <a className={styles.link} href="https://www.sanger.ac.uk/">
            Wellcome Sanger Institute
          </a>
          , Cambridge, UK
        </p>
      </div>
    </TextPanel>
  );

  return (
    <div className={styles.infoPage}>
      <div
        className={classnames(
          styles.flexCenter,
          styles.flexCenterHorizontal,
          styles.fullWidth
        )}
      >
        {text}
      </div>
    </div>
  );
};

export default AboutPage;

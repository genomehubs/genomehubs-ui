import React, { useEffect } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import TextPanel from "./TextPanel";

const TutorialPage = ({}) => {
  let text = (
    <TextPanel view={"tutorials"}>
      <div>
        <p>
          We'll be adding more help and tutorials here soon. To get started, try
          following the example below.
        </p>

        <p>
          Task: To find the best genome size estimate for a new sample about to
          be sequenced. Let's say the sample to be sequenced is `Heliconius
          egeria`.
        </p>

        <ol>
          <li>
            On the home page, in the main central search box, type `Heliconius
            egeria` and press Enter. If there are multiple scientific name
            matches, or if the term is misspelt (e.g., `haliconius egeria`), the
            tool will offer multiple suggestions. Click on `Heliconius egeria -
            species`
          </li>
          <li>
            You are now on the `Search` page which shows you information about
            each species-level descendant of your search for which any genome
            size or chromosome number metadata is available. In this case there
            are no descendants such as subspecies for Heliconius egeria, so only
            one record is shown.
          </li>
          <li>
            The little boxes show you summary info for each species, and the
            colours indicate whether the estimates are directly measured for
            that species (green), or inferred from ancestors or descendant taxa
            (red), and the `n` value tells you how many values were used for the
            estimate. For some species, multiple genome assembly versions exist,
            or multiple C value estimates are stored, so `n` can be greater than
            1.
          </li>
          <li>
            To see more than just a little boxed summary, click on `Records` in
            the top menu. The full raw data table for each species in our
            database will be shown.
          </li>
          <li>
            In the `Records` view, there is a single "direct" value for
            chromosome_number - i.e. it was measured for that species. Clicking
            on the arrow next to "direct" (with a green underline) takes you to
            the source of this value
          </li>
          <li>
            The remaining estimates for C value and genome size are indirect
            (underlined in red), and are estimated based on the ancestor of
            `Heliconius egeria`, i.e., the genus `Heliconius`, which has 2
            "direct" values for the genus as a whole.
          </li>
          <li>
            Therefore the best estimates for `Heliconius egeria` are:
            <ul>
              <li>chromosome number: 21</li>
              <li>genome size: 347 Mbp</li>
              <li>C value: 0.355</li>
            </ul>
          </li>
          <li>
            To double check that the estimates are not an outlier, you should
            click on `Explore` - which lets you see each estimate for each level
            of the taxonomy, e.g., genus, family, order, etc.
          </li>
        </ol>
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

export default TutorialPage;

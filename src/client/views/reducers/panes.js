import { createAction, handleAction } from "redux-actions";

export const setPanes = createAction("SET_PANES");
export const panes = handleAction(
  "SET_PANES",
  (state, action) => action.payload,
  [
    {
      id: "searchPane",
      title: "Search GoaT",
      short: "search",
      view: "search",
      image: "search.png",
      text:
        "Search by the scientific name of any taxon (partial names and misspellings welcome).",
    },
    {
      id: "recordPane",
      title: "Browse Records",
      short: "records",
      view: "records",
      image: "browse.png",
      text:
        "For a given taxon (at any level: species, genus, family, order, etc.), browse all the metadata available for all its descendants at the species level.",
    },
    {
      id: "explorePane",
      title: "Explore Data",
      short: "explore",
      view: "explore",
      image: "explore.png",
      text:
        "Explore C value, genome size, and chromosome numbers for all ancestor/descendant taxa of a given taxon, and see how the estimates change as you explore the tree of life.",
    },
    {
      id: "reportPane",
      title: "View Reports",
      short: "report",
      view: "report",
      image: "placeholderRed.png",
      text: "Reports on the data in GoaT will be added here soon.",
    },
    {
      id: "tutorialPane",
      title: "View Tutorials",
      short: "help",
      view: "tutorials",
      image: "tutorial.png",
      text: "Find help and tutorials to learn how to use GoaT.",
    },
    {
      id: "aboutPane",
      title: "About GenomeHubs/GoaT",
      short: "about",
      view: "about",
      image: "about.jpg",
      text:
        "Genomes on a Tree (GoaT) is built using GenomeHubs 2.0, to present metadata including genome sizes, C values, and chromosome numbers on a tree.",
    },
  ]
);
export const getPanes = (state) => state.panes;

export const paneReducers = {
  panes,
};

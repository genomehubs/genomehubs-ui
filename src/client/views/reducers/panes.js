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
        "Search by taxon name or ID (partial names and misspellings welcome).",
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
      title: "Help & Tutorials",
      short: "help",
      view: "tutorials",
      image: "tutorial.png",
      text: "Find help and tutorials to learn how to use GoaT.",
    },
    {
      id: "aboutPane",
      title: "About GoaT",
      short: "about",
      view: "about",
      image: "about.jpg",
      text:
        "GoaT (Genomes on a Tree) is built using GenomeHubs 2.0, to present metadata including genome sizes, C values, and chromosome numbers for all taxa across the tree of life.",
    },
  ]
);
export const getPanes = (state) => state.panes;

export const paneReducers = {
  panes,
};

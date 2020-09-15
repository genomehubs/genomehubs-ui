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
      text: "Search metadata for taxa in GoaT.",
    },
    {
      id: "recordPane",
      title: "Browse Records",
      short: "records",
      view: "records",
      text: "View full records for individual taxa.",
    },
    {
      id: "explorePane",
      title: "Explore Data",
      short: "explore",
      view: "explore",
      text: "Explore values for individual fields.",
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
      title: "About GenomeHubs",
      short: "about",
      view: "about",
      image: "about.jpg",
      text: "Find out more about the GenomeHubs project.",
    },
  ]
);
export const getPanes = (state) => state.panes;

export const paneReducers = {
  panes,
};

import { createSelector } from "reselect";
import store from "../store";
import qs from "qs";
import { scaleLinear } from "d3-scale";
import {
  schemeReds,
  schemeGreys,
  schemeGreens,
  schemeOranges,
  schemePaired,
} from "d3-scale-chromatic";
import { arc } from "d3-shape";
import {
  cancelNodesRequest,
  getNodes,
  getRootNode,
  setRootNode,
  requestNodes,
  apiUrl,
  receiveNodes,
  resetNodes,
} from "../reducers/tree";

export function fetchNodes(options) {
  return async function (dispatch) {
    if (!options.hasOwnProperty("query")) {
      dispatch(cancelNodeRequest);
    }
    const state = store.getState();
    dispatch(requestNodes());
    const queryString = qs.stringify({ ...options, offset: 0, size: 10000 });
    let url = `${apiUrl}/search?${queryString}`;
    try {
      let json;
      try {
        const response = await fetch(url);
        json = await response.json();
      } catch (error) {
        json = console.log("An error occured.", error);
      }
      dispatch(receiveNodes(json));
    } catch (err) {
      dispatch(cancelNodesRequest());
    }
  };
}

const deepGet = (obj, path, value) => {
  let parts = path.split(".");
  let retVal = obj;
  for (let i = 0; i < parts.length; i++) {
    if (retVal.hasOwnProperty(parts[i])) {
      retVal = retVal[parts[i]];
    } else {
      return value;
    }
  }
  return retVal;
};

export const getTreeNodes = createSelector(
  getNodes,
  getRootNode,
  (nodes, rootNode) => {
    if (!nodes) return undefined;
    let field = "assembly_span";
    let treeNodes = {};
    let maxDepth = 0;
    let shared = {};
    let ancestors = {};
    let tips = {};
    let orderedLineage = [];
    if (Object.values(nodes)[0]) {
      Object.values(nodes)[0].lineage.forEach((anc) => {
        shared[anc.taxon_id] = true;
        orderedLineage.push(anc.taxon_id);
      });
    }
    Object.keys(nodes).forEach((key) => {
      let lineage = [];
      let len = nodes[key].lineage.length;

      for (let i = 0; i < len; i++) {
        let anc = nodes[key].lineage[i];

        maxDepth = Math.max(anc.node_depth, maxDepth);
        lineage.push(anc);
      }
      let child = nodes[key].taxon_id;
      let source = deepGet(nodes[key], `fields.${field}.aggregation_source`);
      let anc_source;
      if (source) {
        anc_source = source != "ancestor" ? "descendant" : "ancestor";
      }
      let newShared = {};
      lineage.forEach((obj) => {
        if (!treeNodes[obj.taxon_id]) {
          treeNodes[obj.taxon_id] = { count: 0, children: {}, ...obj };
        }
        ancestors[child] = obj.taxon_id;

        treeNodes[obj.taxon_id].children[child] = true;
        if (
          !treeNodes[obj.taxon_id].source ||
          treeNodes[obj.taxon_id].source == "ancestor"
        ) {
          treeNodes[obj.taxon_id].source = anc_source;
        }

        child = obj.taxon_id;
        if (shared[child]) {
          newShared[child] = true;
        }
      });
      shared = newShared;
      tips[key] = true;
      if (!treeNodes.hasOwnProperty(key)) {
        treeNodes[key] = { count: 0, children: {}, ...nodes[key], source };
      }
    });
    Object.keys(tips).forEach((key) => {
      const incrementAncestorCounts = (id) => {
        if (!ancestors[id]) return;
        let ancId = ancestors[id];
        treeNodes[ancId].count += 1;
        incrementAncestorCounts(ancId);
      };
      if (Object.keys(treeNodes[key].children).length == 0) {
        treeNodes[key].count = 1;
        incrementAncestorCounts(key);
      }
    });
    let keys = [];
    orderedLineage.reverse().forEach((key) => {
      if (shared[key]) {
        keys.push(key);
      }
    });
    let ancNode;
    if (keys.length > 0) {
      rootNode = keys[keys.length - 1];

      maxDepth -= keys.length - 1;
      if (keys.length > 1) {
        ancNode = keys[keys.length - 2];
      } else {
        ancNode = rootNode;
      }
    }
    return { treeNodes, rootNode, ancNode, maxDepth };
  }
);

export const getTreeRings = createSelector(getTreeNodes, (nodes) => {
  if (!nodes) return undefined;
  let { treeNodes, rootNode, ancNode, maxDepth } = nodes;
  if (!treeNodes || !rootNode) return undefined;
  let radius = 500;
  let rScale = scaleLinear()
    .domain([-1, maxDepth + 1])
    .range([0, 500]);
  let cScale = scaleLinear()
    .domain([0, treeNodes[rootNode] ? treeNodes[rootNode].count : 0])
    .range([0, Math.PI * 2]);
  let arcs = [];
  let tonalRange = 9;
  let baseTone = 3;
  let greys = schemeGreys[tonalRange];
  let reds = schemeReds[tonalRange];
  let greens = schemeGreens[tonalRange];
  let oranges = schemeOranges[tonalRange];
  let alternator = {};

  const ranks = [];

  const drawArcs = ({ node, depth = 0, start = 0, recurse = true }) => {
    if (!node) return {};
    ranks[depth] = node.taxon_rank;
    if (!alternator.hasOwnProperty(depth)) {
      alternator[depth] = depth % 1;
    } else {
      alternator[depth] = (alternator[depth] + 1) % 1;
    }
    let color = greys[baseTone + alternator[depth]];
    if (!recurse) {
      color = "white";
    } else if (node) {
      if (node.source == "direct") {
        color = greens[baseTone + alternator[depth] + 1];
      } else if (node.source == "descendant") {
        color = oranges[baseTone + alternator[depth]];
      }
    }
    let outer = depth + 1;
    if (
      !node.hasOwnProperty("children") ||
      Object.keys(node.children).length == 0
    ) {
      outer = maxDepth + 1;
    }
    arcs.push({
      ...node,
      arc: arc()({
        innerRadius: rScale(depth),
        outerRadius: rScale(outer),
        startAngle: cScale(start),
        endAngle: cScale(start + node.count),
      }),
      start: start,
      depth: depth,
      color,
    });
    if (recurse && node.hasOwnProperty("children")) {
      Object.keys(node.children).forEach((key) => {
        drawArcs({ node: treeNodes[key], depth: depth + 1, start });
        start += treeNodes[key].count;
      });
    }
  };
  drawArcs({ node: treeNodes[ancNode], depth: -1, recurse: false });
  drawArcs({ node: treeNodes[rootNode] });

  let rings = ranks.map((rank, depth) => {
    return {
      arc: arc()({
        innerRadius: rScale(-1),
        outerRadius: rScale(depth),
        startAngle: cScale(0),
        endAngle: cScale(cScale.domain()[1]),
      }),
      taxon_rank: rank,
    };
  });

  return { arcs, rings };
});

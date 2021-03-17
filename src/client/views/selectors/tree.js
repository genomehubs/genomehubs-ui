import { arc, lineRadial } from "d3-shape";
import {
  cancelNodesRequest,
  getNodes,
  getRootNode,
  getTreeHighlight,
  receiveNodes,
  requestNodes,
  resetNodes,
  setRootNode,
} from "../reducers/tree";
import { scaleLinear, scalePow } from "d3-scale";
import {
  schemeGreens,
  schemeGreys,
  schemeOranges,
  schemePaired,
  schemeReds,
} from "d3-scale-chromatic";

import { apiUrl } from "../reducers/api";
import { createSelector } from "reselect";
import qs from "qs";
import store from "../store";

export function fetchNodes(options) {
  return async function (dispatch) {
    if (!options.hasOwnProperty("query")) {
      dispatch(cancelNodeRequest);
    }
    const state = store.getState();
    dispatch(requestNodes());
    let treeOptions = { ...options };
    delete treeOptions.ranks;
    treeOptions.offset = 0;
    treeOptions.size = 10000;
    const queryString = qs.stringify(treeOptions);
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

const isNumeric = (n) => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

const compare = {
  ">": (a, b) => a > b,
  ">=": (a, b) => a >= b,
  "<": (a, b) => a < b,
  "<=": (a, b) => a <= b,
  "=": (a, b) => (Array.isArray(a) ? a.includes(b) : a == b),
  "==": (a, b) => (Array.isArray(a) ? a.includes(b) : a == b),
  contains: (a, b) =>
    Array.isArray(a) ? a.some((value) => value.includes(b)) : a.includes(b),
};

const test_condition = (meta, operator, value) => {
  if (!meta || !meta.value) {
    return false;
  }
  if (!value) {
    return true;
  }
  if (!operator) operator = "=";
  return compare[operator](meta.value, value);
};

export const getTreeNodes = createSelector(
  getNodes,
  getRootNode,
  getTreeHighlight,
  (nodes, rootNode, treeHighlight) => {
    if (!nodes) return undefined;
    let field = treeHighlight.field;
    let operator = treeHighlight.operator;
    let filterValue = treeHighlight.value;
    let treatAncestralAsMissing = true;
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
      let meta = deepGet(nodes[key], `fields.${field}`);
      let source, anc_source;
      let status = 0;
      let value = 1;
      if (meta) {
        source = meta["aggregation_source"];
        value = meta.value ? meta.value : true;
      } else if (!operator || filterValue === undefined) {
        status = 1;
      }
      if (source) {
        if (meta && meta.value) {
          if (source == "ancestor" && treatAncestralAsMissing == true) {
            anc_source = "ancestor";
            if (!operator || filterValue === undefined) {
              status = 1;
            }
          } else {
            status = 1;
            let pass = test_condition(meta, operator, filterValue);
            if (pass) {
              anc_source = source != "ancestor" ? "descendant" : "ancestor";
            } else {
              anc_source = "ancestor";
              source = "ancestor";
            }
          }
        } else {
          anc_source = source != "ancestor" ? "descendant" : "ancestor";
        }
      }
      let newShared = {};
      lineage.forEach((obj) => {
        if (!treeNodes[obj.taxon_id]) {
          if (isNaN(value)) value = 1;
          treeNodes[obj.taxon_id] = {
            count: 0,
            children: {},
            ...obj,
            value,
            status,
          };
        }
        ancestors[child] = obj.taxon_id;

        treeNodes[obj.taxon_id].children[child] = true;
        if (
          !treeNodes[obj.taxon_id].source ||
          treeNodes[obj.taxon_id].source == "ancestor"
        ) {
          treeNodes[obj.taxon_id].source = anc_source;
        }
        if (!treeNodes[obj.taxon_id].status) {
          treeNodes[obj.taxon_id].status = status;
        }

        child = obj.taxon_id;
        if (shared[child]) {
          newShared[child] = true;
        }
      });
      shared = newShared;
      tips[key] = true;
      if (!treeNodes.hasOwnProperty(key)) {
        treeNodes[key] = {
          count: 0,
          children: {},
          ...nodes[key],
          source,
          value,
          status,
        };
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

const outerArc = ({ innerRadius, outerRadius, startAngle, endAngle }) => {
  let arcAttrs = arc()({
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
  }).split(/[A-Z]/);
  return `M${arcAttrs[1]}A${arcAttrs[2]}`;
};

export const getTreeRings = createSelector(getTreeNodes, (nodes) => {
  if (!nodes) return undefined;
  let { treeNodes, rootNode, ancNode, maxDepth } = nodes;
  if (!treeNodes || !rootNode) return undefined;
  let radius = 498;
  let rScale = scalePow()
    .exponent(1)
    .domain([-0.5, maxDepth + 1])
    .range([0, radius]);
  let cMax = treeNodes[rootNode] ? treeNodes[rootNode].count : 0;
  let cScale = scaleLinear().domain([0, cMax]).range([-Math.PI, Math.PI]);
  let arcs = [];
  let tonalRange = 9;
  let baseTone = 2;
  let greys = schemeGreys[tonalRange];
  let reds = schemeReds[tonalRange];
  let greens = schemeGreens[tonalRange];
  let oranges = schemeOranges[tonalRange];
  let scaleFont = false;
  let charLen = 7;
  let charHeight = charLen * 1.3;
  var radialLine = lineRadial()
    .angle((d) => d.a)
    .radius((d) => d.r);

  let labels = [];

  const drawArcs = ({ node, depth = 0, start = 0, recurse = true }) => {
    if (!node) return {};
    let color = greys[baseTone + node.status];
    let highlightColor = greys[baseTone + 1 + node.status];
    if (!recurse) {
      color = "white";
      highlightColor = "white";
    } else if (node) {
      if (node.source == "direct") {
        color = greens[baseTone + 1 + node.status];
        highlightColor = greens[baseTone + 2 + node.status];
      } else if (node.source == "descendant") {
        color = oranges[baseTone + node.status];
        highlightColor = oranges[baseTone + 1 + node.status];
      }
    }
    let outer = depth + 1;
    if (
      !node.hasOwnProperty("children") ||
      Object.keys(node.children).length == 0
    ) {
      outer = maxDepth + 1;
    }
    let innerRadius = rScale(depth);
    let outerRadius = rScale(outer);
    let farOuterRadius = rScale(maxDepth + 1);
    let cStart = start;
    let cEnd = start + node.count;
    if (cEnd - cStart == cMax) {
      cStart = cMax / 10000;
      cEnd -= cStart;
    }
    let startAngle = cScale(cStart);
    let endAngle = cScale(cEnd);
    let midAngle = (startAngle + endAngle) / 2;

    arcs.push({
      ...node,
      arc: arc()({
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
      }),
      highlight: arc()({
        innerRadius,
        outerRadius: farOuterRadius,
        startAngle,
        endAngle,
      }),
      start: start,
      depth: depth,
      color,
      highlightColor,
    });

    const addlabel = (label, { truncate = false, stopIteration = false }) => {
      let nextOpts = { truncate, stopIteration };
      if (truncate) {
        nextOpts.stopIteration = true;
      } else {
        nextOpts.truncate = true;
      }
      let labelLen = charLen * label.length;
      let midRadius = (innerRadius + outerRadius) / 2;
      let arcLen = (endAngle - startAngle) * midRadius;
      let radLen = outerRadius - innerRadius;
      let labelScale = 1;
      if (labelLen < arcLen) {
        if (scaleFont) labelScale = arcLen / labelLen;
        let labelArc = outerArc({
          innerRadius: midRadius,
          outerRadius: midRadius,
          startAngle,
          endAngle,
        });
        labels.push({
          ...node,
          scientific_name: label,
          arc: labelArc,
          labelScale,
        });
      } else if (arcLen > charHeight && labelLen <= radLen) {
        if (scaleFont) labelScale = radLen / labelLen;
        labels.push({
          ...node,
          scientific_name: label,
          arc: radialLine([
            { a: midAngle, r: innerRadius },
            { a: midAngle, r: outerRadius },
          ]),
          labelScale,
        });
      } else if (!stopIteration) {
        if (!truncate) {
          if (node.taxon_rank == "species") {
            let parts = label.split(" ");
            if (parts.length == 2) {
              addlabel(`${parts[0].charAt(0)}. ${parts[1]}`, nextOpts);
            }
          } else if (node.taxon_rank == "subspecies") {
            let parts = label.split(" ");
            if (parts.length == 3) {
              addlabel(
                `${parts[0].charAt(0)}. ${parts[1].charAt(0)}. ${parts[2]}`,
                nextOpts
              );
            }
          } else {
            addlabel(label, nextOpts);
          }
        } else {
          let maxLen = Math.max(arcLen, radLen) / charLen;
          maxLen -= 3;
          if (maxLen > 5) {
            addlabel(`${label.substring(0, maxLen)}...`, nextOpts);
          }
        }
      }
    };
    addlabel(node.scientific_name, {});

    if (recurse && node.hasOwnProperty("children")) {
      let children = [];
      Object.keys(node.children).forEach((key) => {
        children.push(treeNodes[key]);
      });
      children.sort((a, b) => a.count - b.count);
      children.forEach((child) => {
        drawArcs({ node: child, depth: depth + 1, start });
        start += child.count;
      });
    }
  };
  drawArcs({ node: treeNodes[ancNode], depth: -1, recurse: false });
  drawArcs({ node: treeNodes[rootNode] });
  return { arcs, labels };
});

export const getNewickString = createSelector(getTreeNodes, (nodes) => {
  if (!nodes) return undefined;
  let { treeNodes, rootNode } = nodes;
  if (!treeNodes || !rootNode) return undefined;
  const writeNewickString = ({ node }) => {
    if (
      node.hasOwnProperty("children") &&
      Object.keys(node.children).length > 0
    ) {
      let children = Object.keys(node.children).map((key) =>
        writeNewickString({ node: treeNodes[key] })
      );
      return children.length > 1
        ? `(${children.join(",")})${node.scientific_name}`
        : children[0];
    }
    return node.scientific_name;
  };
  let newick = writeNewickString({ node: treeNodes[rootNode] });
  return `${newick};`;
});

import React, { createElement, useEffect, useState } from "react";
import { compose } from "recompose";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import gfm from "remark-gfm";
import { Link, useLocation } from "@reach/router";
import styles from "./Styles.scss";
import Report from "./Report";
import withPages from "../hocs/withPages";
import Tooltip from "@material-ui/core/Tooltip";
import unified from "unified";
import remarkParse from "remark-parse";
import remarkReact from "remark-react";
import classnames from "classnames";
import NavLink from "./NavLink";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";
import { h } from "hastscript";

import remarkRehype from "remark-rehype";
import rehypeReact from "rehype-react";
import rehypeRaw from "rehype-raw";

const muiStyles = (theme) => ({
  root: {
    flexGrow: 1,
  },
});

const processProps = (props, newProps = {}) => {
  for (const [key, value] of Object.entries(props)) {
    if (value == "") {
      newProps[key] = true;
    } else if (key == "class") {
      newProps["class"] = styles[value];
    } else {
      newProps[key] = value;
    }
  }
  return newProps;
};

const RehypeComponentsList = {
  grid: (props) => <Grid {...processProps(props)} />,
  report: (props) => <Report {...processProps(props)} />,
  span: (props) => <span {...processProps(props)} />,
  a: (props) => <NavLink {...processProps(props)} />,
  tooltip: (props) => {
    return (
      <Tooltip {...processProps(props, { placement: "top" })}>
        <span>{props.children}</span>
      </Tooltip>
    );
  },
};

function compile(val, components = RehypeComponentsList) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkReact)
    .use(gfm)
    .use(remarkDirective)
    .use(htmlDirectives)
    .use(remarkRehype)
    .use(rehypeRaw)
    .use(rehypeReact, {
      createElement,
      components,
    });

  const ast = processor.runSync(processor.parse(val));

  return {
    ast,
    contents: processor.stringify(ast),
  };
}

function htmlDirectives() {
  return transform;

  function transform(tree) {
    visit(
      tree,
      ["textDirective", "leafDirective", "containerDirective"],
      ondirective
    );
  }

  function ondirective(node) {
    var data = node.data || (node.data = {});
    var hast = h(node.name, node.attributes);
    data.hName = hast.tagName;
    data.hProperties = hast.properties;
  }
}

const Markdown = ({
  classes,
  pageId,
  pagesById,
  fetchPages,
  siteStyles,
  components = {},
}) => {
  useEffect(() => {
    if (pageId && !pagesById) {
      fetchPages(pageId);
    }
  }, [pageId]);

  RehypeComponentsList;

  const { contents, ast } = compile(pagesById, {
    ...RehypeComponentsList,
    ...components,
  });
  let css;
  if (siteStyles) {
    css = classes.root;
  } else {
    css = classnames(styles.markdown, classes.root);
  }
  return <div className={css}>{contents}</div>;
};

export default compose(withPages, withStyles(styles))(Markdown);

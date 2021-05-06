import React, { createElement, useEffect } from "react";
import { compose } from "recompose";
import Grid from "@material-ui/core/Grid";
import gfm from "remark-gfm";
import styles from "./Styles.scss";
import withPages from "../hocs/withPages";
import Tooltip from "@material-ui/core/Tooltip";
import unified from "unified";
import remarkParse from "remark-parse";
import remarkReact from "remark-react";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";
import { h } from "hastscript";

import remarkRehype from "remark-rehype";
import rehypeReact from "rehype-react";
import rehypeRaw from "rehype-raw";

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

const Markdown = ({ pageId, pagesById, fetchPages }) => {
  useEffect(() => {
    if (pageId && !pagesById) {
      fetchPages(pageId);
    }
  }, [pageId]);

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
    span: (props) => {
      return <span {...processProps(props)} />;
    },
    tooltip: (props) => {
      return (
        <Tooltip {...processProps(props, { placement: "top" })}>
          <span>{props.children}</span>
        </Tooltip>
      );
    },
  };

  function compile(val) {
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
        components: RehypeComponentsList,
      });

    const ast = processor.runSync(processor.parse(val));

    return {
      ast,
      contents: processor.stringify(ast),
    };
  }

  const { contents, ast } = compile(pagesById);
  return <div className={styles.markdown}>{contents}</div>;
};

export default compose(withPages)(Markdown);

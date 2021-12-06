import { Group, Label, Rect, Tag, Text } from "react-konva";

import React from "react";

const KonvaTooltip = ({ e, segment, scale }) => {
  if (!segment) {
    return null;
  }
  const stage = e.target.getStage();
  const offset = { x: stage.x(), y: stage.y() };
  let x = e.evt.layerX - offset.x;
  let y = e.evt.layerY - offset.y;
  x /= scale;
  y /= scale;

  return (
    // <Label x={e.target.attrs.x + e.target.attrs.width / 2} y={e.target.attrs.y}>
    <Label x={x} y={y}>
      <Tag
        fill={"31323f"}
        pointerDirection="down"
        pointerWidth={10}
        pointerHeight={10}
        lineJoin="round"
        shadowColor="black"
      />
      <Text
        text={segment.scientific_name}
        fontSize={12}
        padding={5}
        fill="white"
      />
    </Label>
  );
};

export default KonvaTooltip;

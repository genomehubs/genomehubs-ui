import { Label, Tag, Text } from "react-konva";

import React from "react";

const KonvaTooltip = ({ e, segment }) => {
  if (!segment) {
    return null;
  }
  return (
    <Label x={e.target.attrs.x + e.target.attrs.width / 2} y={e.target.attrs.y}>
      <Tag
        fill="black"
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

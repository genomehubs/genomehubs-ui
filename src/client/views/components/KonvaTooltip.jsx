import { Group, Label, Rect, Tag, Text } from "react-konva";

import React from "react";

const colors = {
  direct: { color: "green", size: 3 },
  descendant: { color: "orange", size: 2 },
  ancestor: { color: "red", size: 1 },
};

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
    <Group>
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
          padding={segment.source ? 10 : 5}
          offsetY={segment.source ? 5 : 0}
          fill="white"
        />
      </Label>
      {segment.source && (
        <Group x={x - 15} y={y - 18 - (segment.status ? 2 : 0)}>
          <Rect height={segment.status ? 5 : 2} width={30} fill={"white"} />
          <Rect
            height={segment.status ? 5 : 2}
            width={colors[segment.source].size * 10}
            fill={colors[segment.source].color}
          />
        </Group>
      )}
    </Group>
  );
};

export default KonvaTooltip;

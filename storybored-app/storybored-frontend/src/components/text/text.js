import React from "react";
import { BsWordpress } from "react-icons/bs";
import { Text } from "react-konva";

const Words = (props) => {
  const { properties } = props;
  return <Text key={properties.key} id={properties.id} x={properties.x} y={properties.y} text={properties.text} />;
};

export default Words;

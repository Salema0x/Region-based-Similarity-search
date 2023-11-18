import React from "react";
import { Card } from "react-bootstrap";

const ImageCard = ({ imageUrl }) => {
  return (
    <Card style={{ width: "18rem" }}>
      <Card.Img variant="top" src={imageUrl} />
      <Card.Body>
        <Card.Title>Image Title</Card.Title>
      </Card.Body>
    </Card>
  );
};

export default ImageCard;

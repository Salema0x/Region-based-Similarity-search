import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import ImageUpload from "./ImageUpload";
import ImageCard from "./ImageCard";

const App = () => {
  const [imageResults, setImageResults] = useState([0]);

  const handleImageUpload = (imageUrl) => {
    // Add logic to send the image URL to the backend for processing
    // and update the imageResults state with the response.
    // You can use fetch or axios for API requests.
    // For now, I'll just add a dummy result to demonstrate.
    setImageResults([{ id: 1, imageUrl }]);
  };

  return (
    <Container>
      <Row className="mt-5">
        <Col>
          <ImageUpload onUpload={handleImageUpload} />
        </Col>
      </Row>
      <Row className="mt-3">
        {imageResults.map((result) => (
          <Col key={result.id} xs={12} md={4} className="mb-4">
            <ImageCard imageUrl={result.imageUrl} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default App;

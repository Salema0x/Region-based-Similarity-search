import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

const ImageUpload = ({ onUpload }) => {
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpload(imageUrl);
    setImageUrl("");
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formImageUrl">
        <Form.Label>Image URL</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        Upload
      </Button>
    </Form>
  );
};

export default ImageUpload;

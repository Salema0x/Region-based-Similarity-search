from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

class UploadAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_upload_local_image(self):
        # Prepare a local image file for testing
        with open('api/test_images/thong.jpg', 'rb') as file:
            data = {'image': file}
            response = self.client.post('/api/upload/', data, format='multipart')

        #print(response.status_code)
        #print(response.content)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    

    def test_upload_image_from_url(self):
        image_url = 'https://media.geeksforgeeks.org/wp-content/uploads/20210318103632/gfg-300x300.png'
        data = {'image_url': image_url}
        response = self.client.post('/api/upload/', data)

        #print(response.content)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_invalid_request(self):
        # Test an invalid request with neither 'image' nor 'image_url'
        data = {'other_field': 'value'}
        response = self.client.post('/api/upload/', data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'No image or url provided')


from rest_framework.test import APITestCase
from django.urls import reverse

class UploadBoxesAPITestCase(APITestCase):
    def test_upload_boxes_valid_data(self):
        url = reverse('api_draw') 

        # Sample valid box data
        valid_boxes_data = [
            {"top_left": {"x": 10, "y": 20}, "bottom_right": {"x": 30, "y": 40}},
            {"top_left": {"x": 50, "y": 60}, "bottom_right": {"x": 70, "y": 80}},
        ]

        data = {"boxes": valid_boxes_data}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Boxes processed successfully')

    def test_upload_boxes_invalid_data(self):
        url = reverse('api_draw') 

        # Sample invalid box data (non-integer coordinates)
        invalid_boxes_data = [
            {"top_left": {"x": 10, "y": "invalid"}, "bottom_right": {"x": 30, "y": 40}},
        ]

        data = {"boxes": invalid_boxes_data}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Invalid box coordinates')



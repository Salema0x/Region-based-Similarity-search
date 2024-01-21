import requests
from django.core.files.base import ContentFile
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
    
from django.core.files.storage import default_storage
import os
from django.conf import settings

def save_image_to_media(image, subfolder=''):
    """
    Save the given image to the MEDIA_ROOT in the specified subfolder.
    Returns the relative path to the saved image.
    """
    file_path = os.path.join(subfolder, image.name)
    saved_image_path_relative = default_storage.save(file_path, ContentFile(image.read()))
    return saved_image_path_relative

@api_view(['POST'])
def upload(request):
    if 'image' in request.data:
        # Handle local image upload
        image = request.data['image']

        subfolder = 'local/'
        # Save the image to the MEDIA_ROOT in the specified subfolder
        saved_image_path_relative = save_image_to_media(image, subfolder)
        # Prepend MEDIA_URL to the relative path > /media/subfolder/image_name
        saved_image_path = os.path.join(settings.MEDIA_URL, saved_image_path_relative)

        # TODO: Process the saved image in bytes as needed

        return Response({'message': f'Image uploaded successfully. Path: {saved_image_path}'}, status=status.HTTP_201_CREATED)

    elif 'image_url' in request.data:
        image_url = request.data['image_url']
        try:
            # Check if the URL exists
            with requests.get(image_url) as r:
                if r.status_code != 200:
                    return Response({'message': 'Invalid URL'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if the URL points to an image
            content_type = r.headers.get('content-type', '')
            if 'image' not in content_type:
                return Response({'message': 'URL does not point to an image'}, status=status.HTTP_400_BAD_REQUEST)

            # Specify the subfolder where the image should be saved
            subfolder = 'url_up/'
            # Save the image to the MEDIA_ROOT in the specified subfolder
            image_name = image_url.split('/')[-1]
            saved_image_path_relative = save_image_to_media(ContentFile(r.content,name=image_name), subfolder)
            # Prepend MEDIA_URL to the relative path > /media/subfolder/image_name
            saved_image_path = os.path.join(settings.MEDIA_URL, saved_image_path_relative)

            # TODO: Process the saved image in bytes as needed

            return Response({'message': f'Image uploaded successfully. Path: {saved_image_path}'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    else:
        return Response({'message': 'No image or url provided'}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def upload_boxes(request):
    boxes_data = request.data.get('boxes')

    # Validate and process each box
    for box_data in boxes_data:
        top_left = box_data.get('top_left', {})
        bottom_right = box_data.get('bottom_right', {})

        # Perform basic validation
        if not all(isinstance(coord, int) for coord in top_left.values()) or \
           not all(isinstance(coord, int) for coord in bottom_right.values()):
            return Response({"error": "Invalid box coordinates"}, status=status.HTTP_400_BAD_REQUEST)

        # Process the box data to the trained model 
        #print(f"Top Left: {top_left}, Bottom Right: {bottom_right}")

    return Response({"message": "Boxes processed successfully"}, status=status.HTTP_201_CREATED)


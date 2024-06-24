import sys

sys.path.append('/project/')

import requests
from django.core.files.base import ContentFile
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
    
from django.core.files.storage import default_storage
from django.conf import settings

from app.util import allowed_file, batch_inference, parse_es_results, es_query_str, es_query, es_count, load_image
from app.config import Config as cfg
from app.config import logger

from PIL import Image as pil_image
import requests
import time
import json
import os
import io





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



@api_view(['POST'])
def search_image_all(request):
    """
    Perform query and visualize results
    :return:
    """
    images = []
    error = ""
    querytime = 0
    max_results = cfg.ES_MAX_RESULTS

    try:
        try:
            max_results = int(request.data.get("maxResults"))
        except:
            error = "Maximum results is not a number"
            raise
        img = getImage(request)
        start = time.time()
        images = searchSimilarWholeImages(img, max_results, True)
        querytime = time.time() - start

    except Exception as e:
        logger.error(e, exc_info=True)

    #num_db_images = es_count()
    
    return Response({'duration':querytime,
                    'images':images,
                    'thumbs_url':cfg.THUMBS_URL, 
                    'images_url':cfg.IMAGES_URL}, 
                    status=status.HTTP_201_CREATED)



@api_view(['POST'])
def search_image_box(request):
    """
    Perform query and visualize results
    :return:
    """
    images = []
    error = ""
    querytime = 0
    max_results = cfg.ES_MAX_RESULTS

    try:
        try:
            max_results = int(request.data.get("maxResults"))
        except:
            error = "Maximum results is not a number"
            raise Exception(error)
        img = getImage(request)
        
        # Opens a image in RGB mode
        #pillowed_image = pil_image.open(io.BytesIO(img))
        pillowed_image = load_image(img)
        
        # Setting the points for cropped image
        try:
            left = int(request.data.get("left"))
            top = int(request.data.get("top"))
            right = int(request.data.get("right"))
            bottom = int(request.data.get("bottom"))
        except:
            error = "Selected region information missing"
            raise Exception(error)
    
        start = time.time()
        # Cropped image of above dimension
        # (It will not change original image)
        imgcropped = pillowed_image.crop((left, top, right, bottom))
        images = searchSimilarWholeImages(imgcropped, max_results, False)
        querytime = time.time() - start

    except Exception as e:
        logger.error(e, exc_info=True)
    
    return Response({'duration':querytime,
                    'images':images,
                    'thumbs_url': cfg.THUMBS_URL, 
                    'images_url':cfg.IMAGES_URL}, 
                    status=status.HTTP_201_CREATED)



def getImage(request):
    error = ""
    try:
        try:
            img = request.data.get("image")
        except:
            error = "Error in form data"
            raise Exception(error)
        if "image" in request.FILES and request.FILES["image"]:
            # Query image uploaded
            file =  request.FILES.get("image")
            if allowed_file(img.content_type):
                error = "File type is not accepted"
                raise Exception(error)
            else:
                try:
                    img = file.read()
                except:
                    error = "Could not read file"
                    raise Exception(error)
    except Exception as e:
        logger.error(e, exc_info=True)
    return img



def searchSimilarWholeImages(image, max_results:int, isReloadingRGB:bool):
    error = ""
    try:
        try:
            img = load_image(image) if isReloadingRGB else image
            files = {"query_image": {"qi.jpg": img}}
            code_dict = batch_inference(files)[0]['codes']
            q = es_query_str(code_dict)
            res = es_query(q, max_results)
        except:
            error = "No result from Elasticsearch"
            raise Exception(error)
        try:
            images = parse_es_results(res)
        except:
            error = "Could not parse Elasticsearch results"
            raise Exception(error)
    except Exception as e:
        logger.error(e, exc_info=True)
    return images
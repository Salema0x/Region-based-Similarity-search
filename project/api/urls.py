from django.urls import path
from .views import upload, upload_boxes, search_image_all, search_image_box

urlpatterns = [
    path('api/upload/', upload, name='upload'),
    path('api/draw/', upload_boxes, name='api_draw'),
    path('api/search/', search_image_all, name='search_image_all'),
    path('api/searchbox/', search_image_box, name='search_image_box'),
]
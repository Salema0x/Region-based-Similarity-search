from django.urls import path
from .views import upload, upload_boxes

urlpatterns = [
    path('api/upload/', upload, name='upload'),
    path('api/draw/', upload_boxes, name='api_draw'),
]
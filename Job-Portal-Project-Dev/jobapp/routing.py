from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    
    re_path(r'ws/jobchat/(?P<room_name>\w+)/$', consumers.JobChatConsumer.as_asgi()),
]
from django.urls import re_path
from .consumers import ChatConsumer
 
websocket_urlpatterns = [
    re_path(r"ws/chat/$", ChatConsumer.as_asgi()),
]
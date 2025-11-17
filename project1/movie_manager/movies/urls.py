
from django.urls import path
from . import views
from django.conf import settings 
from django.conf.urls.static import static

urlpatterns = [
    path('create/', views.create,name='create'),
    path('edit/<pk>', views.edit,name='edit'),
    path('list/', views.list,name='list'),
    path('delete/<pk>', views.delete,name='delete'),
    path('', views.menu,name='menu'),
]
urlpatterns += static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)

from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing, name='landing'),
    path('students/', views.students, name='students'),
    path('students/athletics/', views.athletics, name='athletics'),
    path('students/faith/', views.faith, name='faith'),
    path('students/pilgrimages/', views.pilgrimages, name='pilgrimages'),
    path('prospective/', views.prospective, name='prospective'),
    path('shop/', views.shop, name='shop'),
]

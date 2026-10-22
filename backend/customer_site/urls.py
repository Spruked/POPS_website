from django.urls import path, re_path
from . import views

urlpatterns = [
    path('api/customer/session', views.session),
    path('api/customer/register', views.register),
    path('api/customer/login', views.sign_in),
    path('api/customer/logout', views.sign_out),
    path('api/customer/verify', views.verify),
    path('api/customer/verification', views.request_link, {'kind': 'verify'}),
    path('api/customer/recovery', views.request_link, {'kind': 'reset'}),
    path('api/customer/reset', views.reset),
    path('api/customer/beta', views.beta),
    path('api/customer/support', views.support),
    re_path(r'^api/checkout(?:/.*)?$', views.checkout_unavailable),
]

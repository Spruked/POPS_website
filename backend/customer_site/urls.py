from django.urls import path, re_path
from . import views
from . import profile_views
from . import geography

urlpatterns = [
    path('api/customer/admin/geography', geography.geography),
    path('api/customer/admin/customers', geography.customers),
    path('api/customer/admin/status', geography.account_status),
    path('api/customer/options', profile_views.options),
    path('api/customer/profile', profile_views.profile),
    path('api/customer/profile/save', profile_views.save_profile),
    path('api/customer/preferences', profile_views.preferences),
    path('api/customer/preferences/history', profile_views.consent_history),
    path('api/customer/email/change', profile_views.email_change),
    path('api/customer/email/cancel', profile_views.cancel_email_change),
    path('api/customer/email/verify', profile_views.verify_email_change),
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

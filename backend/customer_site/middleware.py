from django.contrib.auth import logout
from .profile_service import ensure_customer

class CustomerSessionSecurity:
    """Status changes and verified email changes revoke existing sessions."""
    def __init__(self, get_response): self.get_response=get_response
    def __call__(self, request):
        if request.user.is_authenticated:
            profile=ensure_customer(request.user)
            version=request.session.get('customer_auth_version')
            if profile.status!='active' or not profile.email_verified or (version is not None and version!=profile.auth_version):
                logout(request)
            elif version is None:
                request.session['customer_auth_version']=profile.auth_version
        return self.get_response(request)

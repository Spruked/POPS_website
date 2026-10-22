from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission

class Command(BaseCommand):
    help='Create least-privilege customer groups. Does not grant staff status or assign users.'
    def handle(self,*args,**kwargs):
        roles={
            'Customer Geographic Analyst':['view_geography'],
            'Customer Support':['view_customerprofile'],
            'Customer Account Manager':['view_customerprofile','manage_customer_status','view_geography'],
        }
        for name,codes in roles.items():
            group,_=Group.objects.get_or_create(name=name)
            group.permissions.set(Permission.objects.filter(content_type__app_label='customer_site',codename__in=codes))
            self.stdout.write(name)
        self.stdout.write('Assign a group only to an authorized staff user. Individual access requires a recorded business purpose.')

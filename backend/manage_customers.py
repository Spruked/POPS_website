"""Isolated website customer service. Does not import the existing runtime."""
import os
import sys

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'customer_site.settings')
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)

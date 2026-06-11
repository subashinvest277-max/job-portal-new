"""
Management command to create an admin user for the job portal.

Usage:
    python manage.py create_admin

Place this file at:
    accounts/management/commands/create_admin.py

(Create the folders if they don't exist and add empty __init__.py files)
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import AdminProfile

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a default admin user for the job portal'

    def add_arguments(self, parser):
        parser.add_argument('--email',    default='admin@jobportal.com')
        parser.add_argument('--username', default='admin')
        parser.add_argument('--password', default='Admin@123')

    def handle(self, *args, **options):
        email    = options['email']
        username = options['username']
        password = options['password']

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Admin user with email "{email}" already exists.'))
            return

        user = User.objects.create_user(
            username  = username,
            email     = email,
            password  = password,
            user_type = 'admin',
            is_staff  = True,
            is_active = True,
        )

        # Create the AdminProfile linked to this user
        AdminProfile.objects.create(
            user         = user,
            access_level = 'Full',
        )

        self.stdout.write(self.style.SUCCESS(
            f'Admin created successfully!\n'
            f'  Email:    {email}\n'
            f'  Username: {username}\n'
            f'  Password: {password}\n'
            f'  Type:     {user.user_type}'
        ))
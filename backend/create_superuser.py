from django.contrib.auth import get_user_model
import os

User = get_user_model()
username = os.environ.get('SUPERUSER_USERNAME')
email = os.environ.get('SUPERUSER_EMAIL')
password = os.environ.get('SUPERUSER_PASSWORD')

if not username or not password:
    raise SystemExit('SUPERUSER_USERNAME and SUPERUSER_PASSWORD must be set in environment')

User.objects.filter(username=username).delete()
User.objects.create_superuser(username, email if email else None, password)
print(f"Superuser '{username}' created or replaced.")

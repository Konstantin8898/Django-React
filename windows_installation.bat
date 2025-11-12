@echo off

cd frontend
call npm install

echo Frontend packages and dependencies installed

cd ..

python -m venv .venv
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip

python -m pip install -r backend\requirements.txt

echo Virtual environment and backend dependencies installed

cd backend

python manage.py migrate

set "SUPERUSER_USERNAME=admin"
set "SUPERUSER_EMAIL=admin@example.com"
set "SUPERUSER_PASSWORD=password"

cmd /c "python manage.py shell < create_superuser.py"

echo Superuser %SUPERUSER_USERNAME% created for access to the Django admin
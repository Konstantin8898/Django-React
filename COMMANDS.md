
# Команды для работы с Django-проектом

## 1. Установка виртуальной среды
```sh
python -m venv .venv
```

## 2. Активация виртуальной среды
- **Windows (cmd):**
	```sh
	.venv\Scripts\activate.bat
	```
- **Linux/MacOS:**
	```sh
	source .venv/bin/activate
	```

### Деактивация виртуальной среды
```sh
deactivate
```

## 3. Установка Django
```sh
python -m pip install Django
```

## 4. Создание проекта на Django
```sh
django-admin startproject <project_name>
```

### Запуск проекта на Django
```sh
python manage.py runserver
```

## 5. Создание приложения в проекте
```sh
python manage.py startapp core
```

## 6. Установка Django Rest Framework и дополнительных пакетов
```sh
pip install djangorestframework
pip install markdown         # Markdown support for the browsable API
pip install django-filter    # Filtering support for the browsable API
```

## 7. Миграции после создания моделей
```sh
python manage.py makemigrations
python manage.py migrate
```

## 8. Создание проекта на React
```sh
npx create-react-app frontend
```

### 9. Запуск проекта на React
```sh
npm start
```
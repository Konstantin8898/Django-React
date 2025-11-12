Простое приложение "Django + React" для публикации постов с возможностью лайков, дизлайков и комментариев.

## Структура репозитория (важное)
- `backend/` — Django-приложение
  - `manage.py` — точка запуска Django
  - `requirements.txt` — зависимости Python
  - `db.sqlite3` — локальная БД (dev)
  - `backend/` — Django project (settings, urls, wsgi/asgi)
  - `core/` — Django app (models, serializers, views, migrations)
  - `media/` — загружаемые файлы (картинки постов)
- `frontend/` — React SPA (src, public, package.json)
- Сценарии и вспомогательные файлы:
  - `start_backend.bat` / `start_backend.sh` — запуск бэкенда
  - `start_frontend.bat` / `start_frontend.sh` — запуск фронтенда
  - `windows_installation.bat`, `COMMANDS.md` — вспомогательные инсталляционные скрипты/инструкции

## Что внутри
- Бэкенд реализован с помощью Django REST Framework. Аутентификация — token-based (DRF Token).
- Модели: Post, Like, Dislike, Comment (комментарии, лайки/дизлайки привязаны к пользователям и постам).
- Фронтенд — React (компоненты в `frontend/src/components`), использует Ant Design.

## Быстрая установка и запуск

Рекомендуется запускать из корня репозитория. Ниже — команды для Windows (PowerShell).

Важно: перед первым запуском убедитесь, что у вас установлены Python 3.8+ и Node.js/npm.

### Windows (PowerShell)

1) Запуск бэкенда (скрипт):

```powershell
.\start_backend.bat
```

Если хотите выполнить шаги вручную:

```powershell
cd backend
python -m venv .venv
. .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
# опционально: создать суперпользователя
python create_superuser.py
python manage.py runserver 0.0.0.0:8000
```

2) Запуск фронтенда (скрипт):

```powershell
.\start_frontend.bat
```

Или вручную:

```powershell
cd frontend
npm install
npm start
```

Фронтенд по умолчанию на `http://localhost:3000`, бэкенд — `http://localhost:8000`.



Если вы видите ошибки уникальности при добавлении комментариев (например, ограничение на `(post, user)`), проверьте, применены ли миграции; в репозитории уже есть миграция удаления уникального ограничения для комментариев.  

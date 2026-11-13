---
id: 6.4
title: Логин/регистрация + избранное
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: [TASK-3.2-auth-register-and-login, TASK-3.3-auth-me-and-route-protection, TASK-4.1-favorite-repository-and-routes, TASK-6.1-frontend-scaffold]
parent: null
type: feature
tags: [frontend, web, auth]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Формы логина/регистрации, хранение токена (localStorage), страница /favorites, кнопка «В избранное» на карточке. Полный цикл: регистрация → логин → добавление в избранное → просмотр /favorites.

## Критерии приёмки

- Регистрация работает
- Логин работает
- Токен сохраняется в localStorage
- /favorites показывает избранные плагины
- Кнопка «В избранное» на карточке работает

## Отчёт

### Результат

- [ ] Формы логина/регистрации созданы
- [ ] Токен сохраняется в localStorage
- [ ] Страница /favorites создана
- [ ] Кнопка «В избранное» на карточке создана

### Проблемы

### Порождённые задачи
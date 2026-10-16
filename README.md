- запуск приложения :
- из папки с  docker-compose
- docker-compose up -d --build
- порт: http://localhost:80
- задеплоить не получилось ( серваки плак плак ( )


# FlagmanUMIRHackIII-
Веб-приложение для управления складом продуктов и кухонными блюдами. Система учитывает поставки и партии продуктов, контролирует сроки годности, позволяет создавать блюда с рецептами и оформлять заказы.

Проект состоит из backend на ASP.NET Core и frontend на React.

## Основные возможности

- просмотр складских остатков и партий продуктов;
- контроль сроков годности;
- FEFO-сортировка партий: сначала используются партии с ближайшим сроком годности;
- создание и просмотр продуктов;
- создание, изменение и удаление блюд;
- управление составом рецептов;
- создание заказов с проверкой наличия продуктов;
- автоматическое списание продуктов из партий при создании заказа;
- Swagger-документация API в Development-режиме;
- обработка ошибок через Problem Details.

## Технологии

### Backend

- .NET 10;
- ASP.NET Core Minimal APIs;
- Entity Framework Core 10;
- PostgreSQL;

### Frontend

- React 19;
- Vite 8;
- JavaScript ES Modules;
- React Router DOM 7;
- TanStack React Query 5 для запросов и кеширования;
- Chakra UI 2;
- Emotion;
- Framer Motion;
- oxlint;
- стандартный `fetch` для HTTP-запросов.

## Архитектура backend

```text
Backend/
├── Flagman.Domain/          # Доменные сущности, value objects и интерфейсы
├── Flagman.Application/    # Сервисы, use cases, команды, запросы и DTO
├── Flagman.Infrastructure/ # EF Core, DbContext, миграции и репозитории
└── Flagman/                # ASP.NET Core приложение и Minimal API endpoints
```

Основные сущности: `Product`, `Supply`, `Batch`, `Dish`, `RecipeItem`, `Order` и `OrderItem`.

При создании заказа система проверяет блюда и рецепты, рассчитывает необходимые продукты, проверяет остатки, списывает продукты в порядке FEFO и сохраняет заказ со списаниями в транзакции.

## API

Все endpoints backend имеют общий префикс `/api`.

### Products

| Метод | Endpoint | Назначение |
|---|---|---|
| `GET` | `/api/products` | Получить все продукты |
| `POST` | `/api/products` | Создать продукт |

### Orders

| Метод | Endpoint | Назначение |
|---|---|---|
| `GET` | `/api/orders/` | Получить все заказы вместе с позициями |
| `POST` | `/api/orders/` | Создать заказ и списать продукты со склада |

### Dishes

| Метод | Endpoint | Назначение |
|---|---|---|
| `GET` | `/api/dishes/` | Получить все блюда |
| `GET` | `/api/dishes/{id}` | Получить блюдо по идентификатору |
| `POST` | `/api/dishes/` | Создать блюдо |
| `PUT` | `/api/dishes/{id}` | Изменить блюдо |
| `DELETE` | `/api/dishes/{id}` | Удалить блюдо |

### Recipe items

| Метод | Endpoint | Назначение |
|---|---|---|
| `GET` | `/api/recipe-items/` | Получить все позиции рецептов |
| `GET` | `/api/recipe-items/{id}` | Получить позицию рецепта |
| `PUT` | `/api/recipe-items/{id}` | Изменить позицию рецепта |
| `DELETE` | `/api/recipe-items/{id}` | Удалить позицию рецепта |
| `GET` | `/api/dishes/{dishId}/recipe-items` | Получить состав блюда |
| `POST` | `/api/dishes/{dishId}/recipe-items` | Добавить продукт в состав блюда |

### Supplies

| Метод | Endpoint | Назначение |
|---|---|---|
| `POST` | `/api/supplies` | Создать поставку и партии продуктов |
| `GET` | `/api/supplies/{id}` | Получить поставку вместе с партиями |

### Stock

| Метод | Endpoint | Параметры | Назначение |
|---|---|---|---|
| `GET` | `/api/stock` | — | Получить общие остатки по продуктам |
| `GET` | `/api/stock/batches` | `productId`, `includeExpired` | Получить остатки по партиям |

Пример: `GET /api/stock/batches?productId={guid}&includeExpired=false`.

### Expiring

В проекте есть endpoint `GET /api/expiring/`. Он возвращает партии с информацией о сроке годности, количестве оставшихся часов и признаке просрочки. Фильтрация партий, которые истекают в ближайшие часы, дополнительно выполняется frontend.

> В текущей конфигурации endpoint `Expiring` объявлен в проекте, но его необходимо добавить вызовом `api.MapExpiringEndpoints()` в `EndpointExtensions`, если он должен быть доступен через общий `MapEndpoints()`.



## Структура frontend

```text
Frontend/my-app/src/
├── api/          # HTTP-запросы и адаптация ответов backend
├── components/   # Переиспользуемые React-компоненты
├── context/      # React Context, например корзина
├── hooks/        # Пользовательские hooks
├── pages/        # Страницы приложения
├── App.jsx       # Маршрутизация приложения
└── main.jsx      # Точка входа React
```


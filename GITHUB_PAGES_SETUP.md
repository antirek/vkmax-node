# Настройка GitHub Pages для документации

## 🚀 Автоматическая публикация документации

Этот проект настроен для автоматической публикации TypeDoc документации на GitHub Pages при каждом push в main ветку.

## 📋 Что нужно сделать

### 1. Включить GitHub Pages

1. Перейдите в настройки репозитория: `Settings` → `Pages`
2. В разделе `Source` выберите `GitHub Actions`
3. GitHub Actions будет автоматически публиковать документацию

### 2. Настроить права доступа (если нужно)

Если GitHub Pages не работает автоматически:

1. Перейдите в `Settings` → `Actions` → `General`
2. В разделе `Workflow permissions` выберите `Read and write permissions`
3. Поставьте галочку `Allow GitHub Actions to create and approve pull requests`

### 3. Обновить ссылку в README

Замените `your-username` в README.md на ваше реальное имя пользователя GitHub:

```markdown
- 📖 [Документация](https://your-username.github.io/vkmax-node/)
```

## 🔄 Как это работает

### Workflow файлы

- `.github/workflows/docs.yml` - основной workflow для публикации
- `.github/workflows/docs-check.yml` - проверка документации при PR

### Процесс публикации

1. **При push в main ветку:**
   - Устанавливаются зависимости
   - Собирается проект (`npm run build`)
   - Генерируется документация (`npm run docs`)
   - Документация публикуется на GitHub Pages

2. **При Pull Request:**
   - Проверяется, что документация генерируется корректно
   - Выводится список сгенерированных файлов

### Время публикации

- Первая публикация: ~2-3 минуты
- Последующие обновления: ~1-2 минуты

## 📁 Структура документации

После публикации на GitHub Pages будет доступна:

```
https://your-username.github.io/vkmax-node/
├── index.html          # Главная страница
├── modules.html        # Список модулей
├── hierarchy.html      # Иерархия классов
├── classes/            # Документация классов
├── functions/          # Документация функций
├── interfaces/         # Документация интерфейсов
└── types/              # Документация типов
```

## 🛠️ Локальная разработка

### Генерация документации
```bash
npm run docs
```

### Режим разработки
```bash
npm run docs:serve
```

### Просмотр
Откройте `docs/index.html` в браузере

## ✅ Проверка работы

1. Сделайте push в main ветку
2. Перейдите в `Actions` вкладку на GitHub
3. Найдите workflow `Deploy Documentation`
4. Дождитесь завершения (зеленая галочка)
5. Перейдите по ссылке в README для просмотра документации

## 🔧 Устранение проблем

### Документация не публикуется

1. Проверьте, что GitHub Pages включен
2. Проверьте права доступа в `Settings` → `Actions` → `General`
3. Посмотрите логи в `Actions` вкладке

### Ошибки в workflow

1. Проверьте, что все зависимости установлены
2. Убедитесь, что TypeScript компилируется без ошибок
3. Проверьте, что TypeDoc генерирует документацию локально

### Изменения не отображаются

1. GitHub Pages может кэшировать страницы
2. Подождите 5-10 минут
3. Попробуйте очистить кэш браузера

## 📝 Полезные ссылки

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [TypeDoc Documentation](https://typedoc.org/) 
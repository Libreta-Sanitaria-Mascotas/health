### 🩺 `health`
- Registra vacunas/consultas/desparasitaciones y valida mascota existente.
- Expone comandos RMQ para CRUD y, ahora, `link_media` / `unlink_media` para asociar certificados desde el servicio de media.
- Usa Postgres y RabbitMQ (cola `health_queue`).

#### Arranque local
```bash
npm install
npm run start:dev
```
Env por defecto (stack docker):
- `RABBITMQ_URL=amqp://admin:admin123@rabbitmq:5672`
- DB: ver docker-compose (health_db).

#### Workflows sugeridos CI
- `npm ci`
- `npm run lint` (si aplica)
- `npm test`

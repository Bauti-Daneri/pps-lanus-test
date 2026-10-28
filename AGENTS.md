## Reglas del proyecto

### README
- Todo cambio que afecte el comportamiento visible, el stack, las variables de entorno, los comandos, la estructura de carpetas o las decisiones técnicas se refleja en `README.md` en el mismo cambio.
- En "Estado del proyecto", marcar `[x]` solo lo que ya funciona y fue verificado. Nunca marcar algo como hecho sin haberlo probado.
- No inventar funcionalidades ni decisiones: lo que no está implementado va como `[Pendiente]`.
- Si se agrega una variable de entorno, documentarla en "Cómo correrlo" sin valores reales.
- No modificar la sección "Uso de herramientas de IA" salvo pedido explícito del autor.

### Seguridad
- Nunca leer, imprimir ni copiar el contenido de `.env` ni cadenas de conexión completas.
- No hacer commit ni push sin aprobación explícita.

### Versiones
- Prisma está fijado en 7.x. No actualizar a la 8 sin aprobación.
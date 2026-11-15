# Toma landing

Landing estática para Toma, construida con Astro.

## Desarrollo

```bash
npm install
npm run dev
```

## Producción

```bash
npm run build
npm run preview
```

El resultado estático se genera en `dist/`. En Cloudflare Pages, usa `npm run build` como comando y `dist` como directorio de salida.

## Blog

Los artículos viven en `src/content/blog/*.md`. El panel editorial está en `/admin/` y está preparado para Decap CMS con el backend de GitHub. Antes de usarlo, cambia `TU_USUARIO/toma-landing`, `site_domain` y `base_url` en `public/admin/config.yml`.

## Pendientes antes de producción

- Sustituir los enlaces y datos de las páginas legales por la versión revisada.
- Cambiar `PUBLIC_SITE_URL` por el dominio real.
- Confirmar la URL final de Google Play.
- Configurar OAuth de GitHub para Decap CMS si el dominio usa autenticación propia.

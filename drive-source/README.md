# ByteJay Drive World

Editable source for the personalized Three.js portfolio at `/drive/`.

The original world engine and art direction come from Bruno Simon's MIT-licensed
Folio 2025. ByteJay's identity, biography, projects, career timeline, social links,
map labels, landing landmark, and project artwork are customized here.

## Local build

```bash
pnpm install
pnpm vite build --mode production
cp -R dist/. ../drive/
```

`static` links to `../drive`, which keeps the large original world assets in one
place while the editable source remains small.

Useful local preview routes:

- `/drive/` — normal experience
- `/drive/?spawn=projects&open=projects` — project forge review
- `/drive/?spawn=career` — career timeline review

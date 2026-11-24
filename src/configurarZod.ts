import { z } from "zod";

// O zod 4 testa se pode compilar os esquemas com new Function. Com a Content-Security-Policy do nginx, que não deixa
// rodar código montado em texto, esse teste vira uma violação no console. Sem a compilação, os esquemas validam igual.
z.config({ jitless: true });

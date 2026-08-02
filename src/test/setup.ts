import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

// A aplicação interpreta datas civis no fuso operacional de São Paulo.
// Alinhar o ambiente de teste evita que runners em UTC classifiquem como
// "hoje" uma data que ainda pertence ao dia anterior no contexto do produto.
process.env.TZ = 'America/Sao_Paulo';

// O Windows e máquinas com I/O mais lento podem precisar de mais de 1 s para
// resolver os imports lazy após o login. O limite continua curto, mas evita
// falsos negativos sem alterar o comportamento da aplicação.
configure({ asyncUtilTimeout: 5000 });

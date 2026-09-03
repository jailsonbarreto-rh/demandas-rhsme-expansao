# Experimento ESLint 10 — 3 de setembro de 2026

**npm install:** failure

~~~text
npm error code ERESOLVE
npm error ERESOLVE could not resolve
npm error
npm error While resolving: demandas-rhsme@1.0.0
npm error Found: @eslint/js@9.39.5
npm error node_modules/@eslint/js
npm error   dev @eslint/js@"10.0.1" from the root project
npm error   @eslint/js@"9.39.5" from eslint@9.39.5
npm error   node_modules/eslint
npm error     dev eslint@"10.9.1" from the root project
npm error     peer eslint@"^6.0.0 || ^7.0.0 || >=8.0.0" from @eslint-community/eslint-utils@4.9.1
npm error     node_modules/@eslint-community/eslint-utils
npm error       @eslint-community/eslint-utils@"^4.9.1" from @typescript-eslint/utils@8.68.0
npm error       node_modules/@typescript-eslint/utils
npm error         @typescript-eslint/utils@"^8.58.1" from @tanstack/eslint-plugin-query@5.101.4
npm error         node_modules/@tanstack/eslint-plugin-query
npm error         3 more (@typescript-eslint/eslint-plugin, ...)
npm error       1 more (eslint)
npm error     8 more (@tanstack/eslint-plugin-query, ...)
npm error
npm error Could not resolve dependency:
npm error dev @eslint/js@"10.0.1" from the root project
npm error
npm error Conflicting peer dependency: eslint@10.9.1
npm error node_modules/eslint
npm error   peerOptional eslint@"^10.0.0" from @eslint/js@10.0.1
npm error   node_modules/@eslint/js
npm error     dev @eslint/js@"10.0.1" from the root project
npm error
npm error Fix the upstream dependency conflict, or retry this command with --force or --legacy-peer-deps to accept an incorrect (and potentially broken) dependency resolution.
npm error
npm error
npm error For a full report see:
npm error /home/runner/.npm/_logs/2026-09-03T03_20_43_601Z-eresolve-report.txt
npm error A complete log of this run can be found in: /home/runner/.npm/_logs/2026-09-03T03_20_43_601Z-debug-0.log

~~~

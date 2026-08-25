# Keep this aligned with @playwright/test in package.json.
FROM mcr.microsoft.com/playwright:v1.62.1-noble AS framework

ENV CI=true \
    NODE_ENV=test \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY package.json package-lock.json playwright.config.ts tsconfig.json eslint.config.mjs .prettierrc.json ./
COPY src ./src
COPY tests ./tests
COPY scripts ./scripts
COPY traceability ./traceability

# Do not run test code as root. The Playwright image provides pwuser.
RUN mkdir -p /work/playwright-report /work/test-results \
    && chown -R pwuser:pwuser /work

USER pwuser

CMD ["npm", "test"]
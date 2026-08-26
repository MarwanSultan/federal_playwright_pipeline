# Keep this aligned with @playwright/test in package.json.
FROM mcr.microsoft.com/playwright:v1.62.1-noble AS framework

ENV CI=true \
    NODE_ENV=test

WORKDIR /app

# Install dependencies first for optimal Docker layer caching.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy application and test configuration.
COPY playwright.config.ts tsconfig.json eslint.config.mjs .prettierrc.json ./

# Copy source and test assets.
COPY src ./src
COPY tests ./tests
COPY scripts ./scripts
COPY traceability ./traceability

# Create writable directories for reports and test results.
RUN mkdir -p /work/playwright-report /work/test-results \
    && chown -R pwuser:pwuser /work

# Run tests as the non-root Playwright user.
USER pwuser

CMD ["npm", "test"]
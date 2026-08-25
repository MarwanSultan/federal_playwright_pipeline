import { expect, test } from '@playwright/test';

test.describe('FedRAMP.gov critical public workflows', () => {
  test('MCF-001: home page directs users to the Marketplace', async ({ page }) => {
    const response = await page.goto('/');

    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveTitle(/FedRAMP/i);
    await expect(page.getByRole('heading', { name: /FedRAMP Marketplace/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse Marketplace/i })).toBeVisible();
  });

  test('MCF-002: users can browse the FedRAMP Marketplace', async ({ page }) => {
    const response = await page.goto('/marketplace');

    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole('heading', { name: /FedRAMP Marketplace/i })).toBeVisible();
    await expect(page.getByText(/search/i).first()).toBeVisible();
  });

  test('MCF-003: Marketplace Quick Start explains service discovery', async ({ page }) => {
    const response = await page.goto('/marketplace/guide');

    expect(response?.ok()).toBeTruthy();
    await expect(
      page.getByRole('heading', { name: /FedRAMP Marketplace Quick Start Guide/i }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: /Search for Services/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Filter and Sort Results/i })).toBeVisible();
  });

  test('MCF-004: users can review current FedRAMP updates', async ({ page }) => {
    const response = await page.goto('/changelog');

    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole('heading', { name: /FedRAMP Updates Changelog/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Subscribe/i })).toHaveAttribute(
      'href',
      /rss\.xml$/,
    );
  });

  test('MCF-005: users can discover and filter FedRAMP events', async ({ page }) => {
    const response = await page.goto('/events');

    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole('heading', { name: /FedRAMP Events/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Filter & Sort/i })).toBeVisible();
    await expect(page.getByText(/All Items \(\d+ results\)/i)).toBeVisible();
    await expect(page.getByRole('searchbox', { name: 'Search...' })).toBeVisible();
  });
});

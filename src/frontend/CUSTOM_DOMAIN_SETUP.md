# Custom Domain Setup for Incognibro

This guide explains how to configure a custom domain for your Incognibro app deployed on the Internet Computer.

## Prerequisites

- A registered domain name
- Access to your domain's DNS settings
- Your Internet Computer canister ID

## Step 1: Configure DNS Records

You need to create a CNAME record in your domain's DNS settings:

1. Log in to your domain registrar's control panel
2. Navigate to DNS settings
3. Create a new CNAME record:
   - **Name/Host**: `@` (for root domain) or `www` (for subdomain)
   - **Value/Target**: `<canister-id>.icp0.io` or `<canister-id>.raw.icp0.io`
   - **TTL**: 3600 (or your preferred value)

### Example DNS Configuration

For a root domain (e.g., `incognibro.com`):

#!/usr/bin/env bash
# One-time setup so .github/workflows/deploy-server.yml can deploy to Azure:
# creates an Entra app that trusts GitHub Actions' OIDC tokens from this
# repository's "production" environment, lets it manage only the
# ca-ibgroup-server Container App, and stores its ids as GitHub secrets.
# Requires `az login` (with rights to create app registrations) and `gh auth login`.
set -euo pipefail

REPO="ArcGabito/sistema-cms-ibgroup"
APP_NAME="gh-ibgroup-server-deploy"
RESOURCE_GROUP="rg-ibgroup"
CONTAINER_APP="ca-ibgroup-server"

APP_ID="$(az ad app list --display-name "$APP_NAME" --query '[0].appId' -o tsv)"
if [ -z "$APP_ID" ]; then
  echo "==> Creando la app de Entra $APP_NAME"
  APP_ID="$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)"
fi

if [ -z "$(az ad sp list --filter "appId eq '$APP_ID'" --query '[0].id' -o tsv)" ]; then
  echo "==> Creando su service principal"
  az ad sp create --id "$APP_ID" --output none
fi

if [ -z "$(az ad app federated-credential list --id "$APP_ID" --query "[?name=='github-production'].name" -o tsv)" ]; then
  echo "==> Confiando en GitHub Actions (entorno production de $REPO)"
  az ad app federated-credential create --id "$APP_ID" --parameters "{
    \"name\": \"github-production\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:$REPO:environment:production\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }" --output none
fi

echo "==> Permiso Contributor solo sobre la Container App $CONTAINER_APP"
SCOPE="$(az containerapp show -g "$RESOURCE_GROUP" -n "$CONTAINER_APP" --query id -o tsv)"
# A freshly created service principal can take a few seconds to replicate.
for attempt in 1 2 3 4 5 6; do
  az role assignment create --assignee "$APP_ID" --role Contributor --scope "$SCOPE" --output none && break
  echo "   reintentando ($attempt)..."; sleep 10
done

echo "==> Guardando los ids como secretos de GitHub"
gh secret set AZURE_CLIENT_ID --repo "$REPO" --body "$APP_ID"
gh secret set AZURE_TENANT_ID --repo "$REPO" --body "$(az account show --query tenantId -o tsv)"
gh secret set AZURE_SUBSCRIPTION_ID --repo "$REPO" --body "$(az account show --query id -o tsv)"

echo "==> Lanzando el deploy"
gh workflow run deploy-server.yml --repo "$REPO"
echo "Listo. Sigue el progreso con: gh run watch --repo $REPO"

# Technical Debt

## Account movement references

The current data model stores movement relationships in two directions:

- `spents.accountId`, `incomes.accountId`, and `transfers.accountId` / `transfers.to`
- `accounts.spents[]`, `accounts.incomes[]`, and `accounts.transfers[]`

MongoDB does not keep those references synchronized automatically. For now, the service layer updates both sides when creating or deleting movements.

This keeps compatibility with the existing account document shape, but it adds consistency risk if a write partially fails or if future code writes directly through a DAO.

Recommended cleanup:

- Use movement documents as the source of truth.
- Query movements by `accountId` / `to` instead of reading movement id arrays from `accounts`.
- Remove `spents`, `incomes`, and `transfers` arrays from the account model after confirming the frontend and API no longer depend on them.
- Add a migration or cleanup script if production documents need the arrays removed.

# Technical Debt

## Authorization changes (REQ-01)

The API v2 account DTO no longer exposes movement reference arrays and ownership checks do not trust them. Reads of movements and transfers are scoped by account ownership; unauthorized or orphaned references are excluded from results and aggregates rather than repaired. Review existing inconsistent data before deploying: visible totals can differ. Refer to [the authorization contract and test guide](req-01-authorization.md).

Moving a movement between accounts remains blocked until reference consistency is addressed. Deleting an in-use personal spent category is also blocked to avoid creating new orphaned references. These guards do not replace transactions or data reconciliation.

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

# Core E2E Flow Contract

1. Student: discover/search → course detail → registration start → registration success.
2. Provider: authenticate → create/edit owned course → expected saved state.
3. Admin/provider review: approval/rejection behavior when the workflow exists.
4. Future online payment: start → success/failure → registration/payment state → refund, only after the payment model is approved.

Every executable flow needs deterministic fixtures, stable selectors, cleanup, failure artifacts, and a named owner.

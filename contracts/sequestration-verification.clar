;; Sequestration Verification Contract

(define-map verifications
  { credit-id: uint }
  {
    verifier: principal,
    is-verified: bool
  }
)

(define-constant CONTRACT_OWNER tx-sender)

(define-public (verify-sequestration (credit-id uint) (is-verified bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) (err u403))
    (ok (map-set verifications
      { credit-id: credit-id }
      {
        verifier: tx-sender,
        is-verified: is-verified
      }
    ))
  )
)

(define-read-only (get-verification (credit-id uint))
  (map-get? verifications { credit-id: credit-id })
)


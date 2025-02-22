;; Carbon Credit Issuance Contract

(define-data-var next-credit-id uint u0)

(define-map credits
  { credit-id: uint }
  {
    owner: principal,
    amount: uint,
    device-id: uint
  }
)

(define-constant CONTRACT_OWNER tx-sender)

(define-public (issue-credits (device-id uint) (amount uint))
  (let ((credit-id (+ (var-get next-credit-id) u1)))
    (asserts! (is-eq tx-sender CONTRACT_OWNER) (err u403))
    (var-set next-credit-id credit-id)
    (ok (map-set credits
      { credit-id: credit-id }
      {
        owner: tx-sender,
        amount: amount,
        device-id: device-id
      }
    ))
  )
)

(define-public (transfer-credits (credit-id uint) (recipient principal))
  (let ((credit (unwrap! (map-get? credits { credit-id: credit-id }) (err u404))))
    (asserts! (is-eq (get owner credit) tx-sender) (err u403))
    (ok (map-set credits
      { credit-id: credit-id }
      (merge credit { owner: recipient })
    ))
  )
)

(define-read-only (get-credit (credit-id uint))
  (map-get? credits { credit-id: credit-id })
)


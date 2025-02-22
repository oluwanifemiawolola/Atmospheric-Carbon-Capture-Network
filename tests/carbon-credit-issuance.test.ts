import { describe, it, beforeEach, expect } from "vitest"

describe("Carbon Credit Issuance Contract", () => {
  let mockStorage: Map<string, any>
  let nextCreditId: number
  const CONTRACT_OWNER = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  
  beforeEach(() => {
    mockStorage = new Map()
    nextCreditId = 0
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "issue-credits":
        if (sender !== CONTRACT_OWNER) return { success: false, error: 403 }
        const [deviceId, amount] = args
        nextCreditId++
        mockStorage.set(`credit-${nextCreditId}`, {
          owner: sender,
          amount,
          device_id: deviceId,
        })
        return { success: true, value: nextCreditId }
      
      case "transfer-credits":
        const [creditId, recipient] = args
        const credit = mockStorage.get(`credit-${creditId}`)
        if (!credit) return { success: false, error: 404 }
        if (credit.owner !== sender) return { success: false, error: 403 }
        credit.owner = recipient
        return { success: true }
      
      case "get-credit":
        return { success: true, value: mockStorage.get(`credit-${args[0]}`) }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should issue credits", () => {
    const result = mockContractCall("issue-credits", [1, 1000], CONTRACT_OWNER)
    expect(result.success).toBe(true)
    expect(result.value).toBe(1)
  })
  
  it("should not allow non-owners to issue credits", () => {
    const result = mockContractCall("issue-credits", [1, 1000], "user1")
    expect(result.success).toBe(false)
    expect(result.error).toBe(403)
  })
  
  it("should transfer credits", () => {
    mockContractCall("issue-credits", [1, 1000], CONTRACT_OWNER)
    const result = mockContractCall("transfer-credits", [1, "user2"], CONTRACT_OWNER)
    expect(result.success).toBe(true)
  })
  
  it("should not transfer credits if not the owner", () => {
    mockContractCall("issue-credits", [1, 1000], CONTRACT_OWNER)
    const result = mockContractCall("transfer-credits", [1, "user2"], "user3")
    expect(result.success).toBe(false)
    expect(result.error).toBe(403)
  })
  
  it("should get credit information", () => {
    mockContractCall("issue-credits", [1, 1000], CONTRACT_OWNER)
    const result = mockContractCall("get-credit", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      owner: CONTRACT_OWNER,
      amount: 1000,
      device_id: 1,
    })
  })
})


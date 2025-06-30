# 🗳️ Claude + NEAR Voting Agent – Demo Flow

**For:** House of Stake  
**Agent:** Claude connected to `vote.r-1748895584.testnet (Voting)` & `v.r-1748895584.testnet (veNEAR)` via NEAR MCP  
**Frontend:** Next.js + Claude SDK + Wallet Selector (MyNearWallet)

---

## ✅ Demo Goal

Demonstrate how Claude can:

- Read proposals from a NEAR smart contract
- Answer questions about proposals in natural language
- Generate a valid JSON payload to vote
- Integrate with a connected wallet for transaction signing

---

## 🧠 Suggested Interaction Flow

### 1. List active proposals

**Prompt:**

```
What proposals are currently open for vote in vote.r-1748895584.testnet?
```

**Expected response:**

```
Proposal #3 — Title: “Enable staking rewards”
Proposal #4 — Title: “Adjust protocol fee to 0.5%”
```

✔️ Confirms Claude can read from `get_proposals`

---

### 2. View proposal details

**Prompt:**

```
Show me the details of proposal #18.
```

**Expected response:**

```
Proposal #3
Title: Enable staking rewards
Description: Rewards validators with 7% APY.
Options: ["Yes", "No"]
Status: Active
```

✔️ Confirms Claude can access `get_proposal`

---

### 3. Generate vote payload

**Prompt:**

```
I want to vote for proposal #18. Return a valid JSON payload for the vote call.
```

**Expected response:**

```json
{
  "proposal_id": 3,
  "vote": "Yes"
}
```

✔️ Triggers frontend detection → enables "Confirm Vote via Wallet" button

---

### 4. Vote execution

- The user signs the transaction using their connected wallet (via Wallet Selector)
- Claude does not sign or execute — it only assists in composing the intent
- A confirmation is shown in the UI once the transaction is submitted

---

## 🔐 Security Notes

- Claude never has access to the user's private key
- All blockchain interactions are signed by the user in their browser
- The MCP only exposes read-only methods (`get_*`)

---

## 🧪 Optional Cases

### Change vote

**Prompt:**

```
I want to change my vote on proposal #3 to 'No'.
```

---

### Check proposal status

**Prompt:**

```
How many votes does proposal #3 have?
```

**Expected response:**

```
Yes: 12
No: 4
Quorum reached: true
```

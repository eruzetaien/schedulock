# Schedulock

Schedulock is a privacy-first scheduling tool that leverages a blockchain-inspired sequential encryption mechanism. It ensures that no single participant can see the group's availability until everyone has committed to their preferred times.

## How it Works

Schedulock uses a **linked-block architecture**. Each participant’s schedule is encrypted and tied to the previous submission, creating a secure chain. The final result remains "locked" until all participants provide their unique keys.

### The Approach:
1. **Sequential Submission:** You submit your preferred schedule as an encrypted block.
2. **Input Linkage:** The next person creates their block using the previous person's block as an input.
3. **Multi-Key Decryption:** The final schedule is only revealed when every participant provides their decryption key.

---

## Steps to Schedule

Follow these steps to create a secure, tamper-proof group schedule:

1.  **Select Availability:** Choose your preferred starting and ending times.
2.  **Lock the Schedule:** Enter a private key (this can be any random string or passphrase).
3.  **Submit & Generate:** Click **“Submit Schedule.”** The system will generate:
    * An **Encrypted Block** (to be shared with the next person).
    * A **Decryption Key** (keep this safe!).
4.  **Chain the Blocks:** Share your encrypted block with the next member of the group. They will use your block as the base for their submission.
5.  **Reveal the Result:** Once the last person has submitted, gather all individual keys from every member. Input them into the decryptor to reveal the finalized group schedule.

---

## Why Schedulock?

* **Anti-Bias:** Participants cannot see others' availability before submitting their own, preventing "follow-the-leader" scheduling.
* **Privacy:** Your specific availability is hidden behind encryption until the very end.
* **Decentralized Trust:** The schedule is formed by the group, for the group, without a central server seeing the raw data.
---

## Usage Recommendation: Small Groups

Due to the **sequential nature** of the encryption chain, Schedulock is best suited for **small groups (e.g., 3–6 people)**. 

Because each person must wait for the previous participant to lock their block and pass it along, the process follows a linear timeline. While this provides maximum security and prevents social bias, it is most efficient when participants can quickly coordinate the hand-off of the encrypted blocks.
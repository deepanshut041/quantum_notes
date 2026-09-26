---
title: Quantum gates and interference
course: IBM · Basics of quantum information
description: Unitary operations, the Hadamard gate, and the role of phase.
updated: "2026-09-26"
order: 2
tags: [gates, interference]
status: Starter note
sources:
  - title: IBM Quantum Learning — Basics of quantum information
    url: https://quantum.cloud.ibm.com/learning/en/courses/basics-of-quantum-information
---

# Quantum gates and interference

## Gates act on state vectors

An ideal gate on a closed quantum system is represented by a unitary matrix $U$. It preserves normalization because $U^\dagger U=I$.

$$
\ket{\psi'}=U\ket{\psi}.
$$

## Three useful single-qubit gates

| Gate | Matrix | What to remember |
| --- | --- | --- |
| Pauli X | $\begin{pmatrix}0&1\\1&0\end{pmatrix}$ | Exchanges the computational basis states. |
| Pauli Z | $\begin{pmatrix}1&0\\0&-1\end{pmatrix}$ | Changes the sign of the second amplitude. |
| Hadamard | $\frac{1}{\sqrt{2}}\begin{pmatrix}1&1\\1&-1\end{pmatrix}$ | Changes between the computational and plus/minus bases. |

## A Hadamard twice

Starting from $\ket{0}$, the first Hadamard gives $\ket{+}$. The second gives $\ket{0}$ again:

$$
H\ket{0}=\frac{\ket{0}+\ket{1}}{\sqrt{2}},
\qquad H^2=I.
$$

```mermaid
flowchart LR
    A[State 0] -->|Hadamard| B[Plus state]
    B -->|Hadamard| C[State 0]
    C --> D[Measure: always 0]
```

:::definition Interference
When amplitudes leading to the same outcome combine, their phases determine whether they reinforce or cancel. Probabilities are computed after amplitudes have been combined.
:::

## Insert a phase flip

Inserting Z between the two Hadamards changes the answer:

$$
HZH=X, \qquad HZH\ket{0}=\ket{1}.
$$

The relative phase introduced by Z becomes a different measurement outcome after H. This is a useful bridge from [qubits](01-qubits-and-states.md) to interference-based algorithms.

## Check your understanding

<details>
<summary>Does Z change measurement probabilities immediately in the computational basis?</summary>
<p>No. It changes a relative sign, which leaves the squared magnitudes unchanged. A later basis-changing operation can reveal that difference.</p>
</details>

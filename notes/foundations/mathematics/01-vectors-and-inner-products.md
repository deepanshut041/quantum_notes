---
title: Vectors, inner products, and bra-ket notation
description: The linear algebra behind states, amplitudes, and orthogonality.
updated: "2026-09-26"
order: 1
tags: [linear algebra, notation]
status: Starter note
sources:
  - title: MIT OpenCourseWare — Linear Algebra, Spring 2010
    url: https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/
---

# Vectors, inner products, and bra-ket notation

## Kets and bras

A ket $\ket{v}$ is a vector. Its corresponding bra $\bra{v}$ is the conjugate transpose:

$$
\ket{v}=\begin{pmatrix}v_1\\v_2\end{pmatrix},
\qquad
\bra{v}=\begin{pmatrix}v_1^*&v_2^*\end{pmatrix}.
$$

:::warning Remember complex conjugation
Turning a ket into a bra transposes it and conjugates its entries. For example, the complex conjugate of $i$ is $-i$.
:::

## Inner products

For complex vectors, using the standard physics convention,

$$
\braket{u|v}=\sum_j u_j^*v_j.
$$

The inner product is conjugate-linear in the first argument and linear in the second. The norm is $\|v\|=\sqrt{\braket{v|v}}$.

## Orthogonality and normalization

| Property | Condition | Interpretation |
| --- | --- | --- |
| Normalized | $\langle v,v\rangle=1$ | Unit length |
| Orthogonal | $\langle u,v\rangle=0$ | Zero overlap |
| Orthonormal basis | $\langle e_i,e_j\rangle=\delta_{ij}$ | Mutually orthogonal unit vectors spanning the space |

## A complex example

Let $\ket{v}=\frac{1}{\sqrt{2}}(1,i)^T$. Then

$$
\braket{v|v}=\frac{1}{2}\left(1+(-i)i\right)=1.
$$

<details>
<summary>What goes wrong if you forget the complex conjugate?</summary>
<p>You would add 1 and i squared, incorrectly obtaining zero for the squared norm of a nonzero vector.</p>
</details>

## Where this shows up

This language appears in both [qubit states](../states-and-measurement/01-qubits-and-states.md) and [wavefunctions](../states-and-measurement/01-wavefunctions.md). The mathematics is shared even when the representation changes.

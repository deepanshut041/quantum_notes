---
title: Wavefunctions and probability
course: MIT 8.04 · Quantum Physics I
course_id: mit-8-04
description: The continuous-state picture, normalization, and probability density.
updated: "2026-09-26"
order: 1
tags: [wavefunctions, Born rule]
status: Starter note
sources:
  - title: MIT OpenCourseWare — Quantum Physics I, Spring 2016
    url: https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/
---

# Wavefunctions and probability

## From a vector to a function

For a spinless particle moving in one dimension, the position-space wavefunction $\psi(x,t)$ gives a complex amplitude for each position at time $t$.

The probability of finding the particle in an interval $[a,b]$ is

$$
P(a\le x\le b)=\int_a^b |\psi(x,t)|^2\,dx.
$$

:::definition Probability density
The quantity $|\psi(x,t)|^2$ is a probability density. Integrating it over a region gives a probability; its value at one point is not itself a probability.
:::

## Normalization

For a normalized state on the real line,

$$
\int_{-\infty}^{\infty}|\psi(x,t)|^2\,dx=1.
$$

This plays the same role as the sum of squared amplitudes in a [qubit state](../states-and-measurement/01-qubits-and-states.md).

## Position expectation value

If the integral exists, the expected position is

$$
\langle x\rangle=\int_{-\infty}^{\infty}x|\psi(x,t)|^2\,dx.
$$

:::tip Interpretation
An expectation value summarizes the distribution across many identically prepared systems. It need not be the outcome of an individual measurement.
:::

## The continuous and discrete pictures

| Discrete basis | Position representation |
| --- | --- |
| Amplitude $\alpha_j$ | Wavefunction $\psi(x)$ |
| Probability $|\alpha_j|^2$ | Density $|\psi(x)|^2$ |
| Sum over basis labels | Integral over position |

## Check your understanding

<details>
<summary>Does a probability density have to be at most one?</summary>
<p>No. A density can exceed one in the chosen units. The probability obtained by integrating it over any region must be between zero and one.</p>
</details>

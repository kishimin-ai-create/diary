---
name: engineering-principles
description: Core engineering and design principles to apply when writing, reviewing, or refactoring code.
---

# Engineering Principles

## Design Principles

- Code as design.
- Code will be changed.
- KISS (Keep It Simple, Stupid.)
  — prefer **Simple** (low complexity) over **Easy** (convenient but entangled); a powerful tool that is hard to understand is a liability
- DRY (Don't Repeat Yourself.)
- YAGNI (You Aren't Going to Need It.)
- PIE (Program Intently and Expressively.)
- SLAP (Single Level of Abstraction Principle.)
- OCP (Open-Closed Principle.)
- **SRP (Single Responsibility Principle)**
- **DI (Dependency Injection / Dependency Inversion)**

## Architecture & System Laws

- **Conway's Law** — Systems mirror the communication structure of the organization that builds them; use the Inverse Conway Maneuver to align team structure with desired architecture
- **Gall's Law** — A complex system that works evolved from a simple system that worked; never start with complexity, build incrementally
- **Law of Leaky Abstractions** — All non-trivial abstractions leak their implementation details; never rely entirely on an abstraction hiding its internals
- **Tesler's Law (Conservation of Complexity)** — Every system has an irreducible amount of complexity; it can only be moved, not eliminated — prefer moving it away from the user
- **CAP Theorem** — A distributed system can guarantee at most 2 of 3: Consistency, Availability, Partition Tolerance
- **Fallacies of Distributed Computing** — The network is not reliable, latency is not zero, bandwidth is not infinite, topology changes, there are multiple admins, transport has cost, and the network is not homogeneous; design with these in mind
- **Postel's Law (Robustness Principle)** — Be conservative in what you send, be liberal in what you accept
- **Metcalfe's Law** — The value of a network is proportional to the square of its users; design APIs and platforms for composability
- **Zawinski's Law** — Software expands until it can do everything; actively resist feature creep and scope sprawl to preserve the product's original value
- **Law of Unintended Consequences** — Actions in complex systems produce effects not foreseen; test changes thoroughly and observe second-order effects

## Code Quality Laws

- **Hyrum's Law** — With enough users, all observable behaviors of an API will be depended on, regardless of the contract; changing any behavior is a breaking change
- **Boy Scout Rule** — Always leave the code cleaner than you found it; fix small issues as you pass through
- **Broken Windows Theory** — Visible neglect (unfixed bugs, messy code) normalizes further degradation; keep the codebase tidy
- **Technical Debt** — Shortcuts taken now imply future rework cost; name it, track it, and pay it down intentionally
- **Law of Demeter** — Talk only to immediate friends; a method should call only methods of its own object, its parameters, objects it creates, and its direct components
- **Principle of Least Astonishment** — Behavior should match what a reasonable user expects; surprising APIs cause bugs and misuse
- **Kernighan's Law** — Debugging is twice as hard as writing code; write code simple enough that debugging is easy
- **Premature Optimization (Knuth)** — "Premature optimization is the root of all evil"; profile before optimizing; the critical 3% is rarely where you guess
- **LSP (Liskov Substitution Principle)** — Subtypes must be substitutable for their base types without altering program correctness
- **ISP (Interface Segregation Principle)** — Clients should not depend on interfaces they don't use; prefer many small focused interfaces over one large general-purpose interface
- **Cunningham's Law** — The best way to get a correct answer is to post the wrong answer; invite correction to surface truth

## Team & Organization Laws

- **Brooks's Law** — Adding people to a late project makes it later; communication overhead grows as n(n-1)/2
- **Dunbar's Number** — Humans maintain ~150 stable relationships; teams above ~8–10 lose direct communication effectiveness
- **Bus Factor** — Number of team members that can be lost before the project fails; raise it with documentation and knowledge sharing
- **Ringelmann Effect** — Individual productivity decreases as team size grows; keep teams small and individually accountable
- **Price's Law** — Half of total output comes from the square root of contributors; a few people produce most of the work
- **Putt's Law** — Management manages what it does not understand; bridge the gap proactively between technical and management tracks
- **Peter Principle** — In hierarchies, people rise to their level of incompetence; create strong technical career tracks to retain engineers
- **Dilbert Principle** — Incompetent workers are promoted to management; counteract by keeping strong engineers in technical roles
- **Linus's Law** — Given enough eyeballs, all bugs are shallow; open review catches defects faster than isolated development

## Planning & Estimation Laws

- **Parkinson's Law** — Work expands to fill the available time; set explicit, realistic deadlines
- **The Ninety-Ninety Rule** — The first 90% takes 90% of the time; the last 10% takes another 90%; expect the long tail
- **Hofstadter's Law** — It always takes longer than expected, even accounting for Hofstadter's Law; build buffers into every estimate
- **Goodhart's Law** — When a measure becomes a target, it ceases to be a good measure; choose metrics that resist gaming
- **Gilb's Law** — Anything that needs to be quantified can be measured better than not measuring at all; approximate metrics beat no metrics
- **Second-System Effect** — The second system a developer leads tends to be over-engineered; resist adding everything missed the first time

## Testing Laws

- **Testing Pyramid** — Prefer many unit tests > fewer integration tests > even fewer E2E tests; each layer is slower and costlier
- **Pesticide Paradox** — Repeating the same tests stops finding new bugs; continuously update and expand the test suite

## Performance Laws

- **Amdahl's Law** — Speedup from parallelization is capped by the sequential fraction; 20% sequential code limits max speedup to 5×
- **Gustafson's Law** — Larger problems benefit more from parallelism; Amdahl's pessimism shrinks as problem size grows

## Software Evolution Laws

- **Lehman's Laws** — Software must continually adapt or become less satisfactory; complexity accumulates with each change; pay down technical debt continuously
- **Sturgeon's Law** — 90% of everything is mediocre; most code and libraries are suboptimal; curate aggressively
- **Murphy's Law** — Anything that can go wrong will; design for graceful failure, not just the happy path

## Cognitive Laws & Mental Models

- **Dunning-Kruger Effect** — Low-competence people overestimate their skill; experts underestimate theirs; stay humble, seek feedback
- **Hanlon's Razor** — Never attribute to malice what is adequately explained by incompetence; assume mistakes before bad intent
- **Occam's Razor** — Among competing explanations, prefer the one with fewest assumptions; prefer the simplest design that works
- **Sunk Cost Fallacy** — Do not continue a bad investment because of past costs; decide on future value, not past spend
- **The Map Is Not the Territory** — The abstraction is not reality; all models are wrong, some are useful; don't mistake the model for the system
- **Confirmation Bias** — We seek information that confirms existing beliefs; actively test assumptions against disconfirming evidence
- **The Hype Cycle & Amara's Law** — We overestimate new technology short-term and underestimate it long-term; evaluate tools at the Slope of Enlightenment, not the Peak of Inflated Expectations
- **The Lindy Effect** — The longer a technology has survived, the longer it will likely continue; proven tools outlast hype
- **First Principles Thinking** — Break problems to fundamental truths; rebuild solutions from the ground up rather than by analogy
- **Inversion** — Consider what you want to avoid, not just what you want to achieve; inverting the problem often reveals the solution
- **Pareto Principle (80/20 Rule)** — 80% of effects come from 20% of causes; find and focus on the high-leverage 20%

- Changeability
- Interoperability
- Efficiency
- Reliability
- Testability
- Reusability

## Code Structure Principles

- Simplicity Principle
- Isomorphism Principle
- Symmetry Principle
- Hierarchy Principle
- Linearity Principle
- Clarity Principle
- Safety Principle

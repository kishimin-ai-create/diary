---
name: engineering-principles
description: Core engineering and design principles to apply when writing, reviewing, or refactoring code.
---

# Engineering Principles

## Design Principles

- Code as design.
- Code will be changed.
- KISS (Keep It Simple, Stupid.) — prefer **Simple** (low complexity) over **Easy** (convenient but entangled); a powerful tool that is hard to understand is a liability
- DRY (Don't Repeat Yourself.)
- YAGNI (You Aren't Going to Need It.)
- PIE (Program Intently and Expressively.)
- SLAP (Single Level of Abstraction Principle.)
- OCP (Open-Closed Principle.)
- **SRP (Single Responsibility Principle)** — each class/module should have only one reason to change; a `UserManager` that handles validation, DB access, email, and logging should be split into `UserValidator`, `UserRepository`, `EmailService`, and an orchestrating service; changes to email format affect only `EmailService` ([SOLID — lawsofsoftwareengineering.com](https://lawsofsoftwareengineering.com/laws/solid-principles/))
- **DI (Dependency Injection / Dependency Inversion)** — depend on abstractions, not concretions; inject dependencies through constructor parameters or interfaces rather than instantiating them directly inside a class; enables swapping test doubles without changing production code ([SOLID — lawsofsoftwareengineering.com](https://lawsofsoftwareengineering.com/laws/solid-principles/))
- Naming is important.

## Architecture & System Laws

- **Conway's Law** — Systems mirror the communication structure of the organization that builds them; use the Inverse Conway Maneuver to align team structure with desired architecture ([source](https://lawsofsoftwareengineering.com/laws/conways-law/))
- **Gall's Law** — A complex system that works evolved from a simple system that worked; never start with complexity, build incrementally ([source](https://lawsofsoftwareengineering.com/laws/galls-law/))
- **Law of Leaky Abstractions** — All non-trivial abstractions leak their implementation details; never rely entirely on an abstraction hiding its internals ([source](https://lawsofsoftwareengineering.com/laws/law-of-leaky-abstractions/))
- **Tesler's Law (Conservation of Complexity)** — Every system has an irreducible amount of complexity; it can only be moved, not eliminated — prefer moving it away from the user ([source](https://lawsofsoftwareengineering.com/laws/teslers-law/))
- **CAP Theorem** — A distributed system can guarantee at most 2 of 3: Consistency, Availability, Partition Tolerance ([source](https://lawsofsoftwareengineering.com/laws/cap-theorem/))
- **Fallacies of Distributed Computing** — The network is not reliable, latency is not zero, bandwidth is not infinite, topology changes, there are multiple admins, transport has cost, and the network is not homogeneous; design with these in mind ([source](https://lawsofsoftwareengineering.com/laws/fallacies-of-distributed-computing/))
- **Postel's Law (Robustness Principle)** — Be conservative in what you send, be liberal in what you accept ([source](https://lawsofsoftwareengineering.com/laws/postels-law/))
- **Metcalfe's Law** — The value of a network is proportional to the square of its users; design APIs and platforms for composability ([source](https://lawsofsoftwareengineering.com/laws/metcalfes-law/))
- **Zawinski's Law** — Software expands until it can do everything; actively resist feature creep and scope sprawl to preserve the product's original value ([source](https://lawsofsoftwareengineering.com/laws/zawinskis-law/))
- **Law of Unintended Consequences** — Actions in complex systems produce effects not foreseen; test changes thoroughly and observe second-order effects ([source](https://lawsofsoftwareengineering.com/laws/law-of-unintended-consequences/))

## Code Quality Laws

- **Hyrum's Law** — With enough users, all observable behaviors of an API will be depended on, regardless of the contract; changing any behavior is a breaking change ([source](https://lawsofsoftwareengineering.com/laws/hyrums-law/))
- **Boy Scout Rule** — Always leave the code cleaner than you found it; fix small issues as you pass through ([source](https://lawsofsoftwareengineering.com/laws/boy-scout-rule/))
- **Broken Windows Theory** — Visible neglect (unfixed bugs, messy code) normalizes further degradation; keep the codebase tidy ([source](https://lawsofsoftwareengineering.com/laws/broken-windows-theory/))
- **Technical Debt** — Shortcuts taken now imply future rework cost; name it, track it, and pay it down intentionally ([source](https://lawsofsoftwareengineering.com/laws/technical-debt/))
- **Law of Demeter** — Talk only to immediate friends; a method should call only methods of its own object, its parameters, objects it creates, and its direct components ([source](https://lawsofsoftwareengineering.com/laws/law-of-demeter/))
- **Principle of Least Astonishment** — Behavior should match what a reasonable user expects; surprising APIs cause bugs and misuse ([source](https://lawsofsoftwareengineering.com/laws/principle-of-least-astonishment/))
- **Kernighan's Law** — Debugging is twice as hard as writing code; write code simple enough that debugging is easy ([source](https://lawsofsoftwareengineering.com/laws/kernighans-law/))
- **Premature Optimization (Knuth)** — "Premature optimization is the root of all evil"; profile before optimizing; the critical 3% is rarely where you guess ([source](https://lawsofsoftwareengineering.com/laws/premature-optimization/))
- **LSP (Liskov Substitution Principle)** — Subtypes must be substitutable for their base types without altering program correctness ([source](https://lawsofsoftwareengineering.com/laws/solid-principles/))
- **ISP (Interface Segregation Principle)** — Clients should not depend on interfaces they don't use; prefer many small focused interfaces over one large general-purpose interface ([source](https://lawsofsoftwareengineering.com/laws/solid-principles/))
- **Cunningham's Law** — The best way to get a correct answer is to post the wrong answer; invite correction to surface truth ([source](https://lawsofsoftwareengineering.com/laws/cunninghams-law/))

## Team & Organization Laws

- **Brooks's Law** — Adding people to a late project makes it later; communication overhead grows as n(n-1)/2 ([source](https://lawsofsoftwareengineering.com/laws/brooks-law/))
- **Dunbar's Number** — Humans maintain ~150 stable relationships; teams above ~8–10 lose direct communication effectiveness ([source](https://lawsofsoftwareengineering.com/laws/dunbars-number/))
- **Bus Factor** — Number of team members that can be lost before the project fails; raise it with documentation and knowledge sharing ([source](https://lawsofsoftwareengineering.com/laws/bus-factor/))
- **Ringelmann Effect** — Individual productivity decreases as team size grows; keep teams small and individually accountable ([source](https://lawsofsoftwareengineering.com/laws/ringelmann-effect/))
- **Price's Law** — Half of total output comes from the square root of contributors; a few people produce most of the work ([source](https://lawsofsoftwareengineering.com/laws/prices-law/))
- **Putt's Law** — Management manages what it does not understand; bridge the gap proactively between technical and management tracks ([source](https://lawsofsoftwareengineering.com/laws/putts-law/))
- **Peter Principle** — In hierarchies, people rise to their level of incompetence; create strong technical career tracks to retain engineers ([source](https://lawsofsoftwareengineering.com/laws/peter-principle/))
- **Dilbert Principle** — Incompetent workers are promoted to management; counteract by keeping strong engineers in technical roles ([source](https://lawsofsoftwareengineering.com/laws/dilbert-principle/))
- **Linus's Law** — Given enough eyeballs, all bugs are shallow; open review catches defects faster than isolated development ([source](https://lawsofsoftwareengineering.com/laws/linuss-law/))

## Planning & Estimation Laws

- **Parkinson's Law** — Work expands to fill the available time; set explicit, realistic deadlines ([source](https://lawsofsoftwareengineering.com/laws/parkinsons-law/))
- **The Ninety-Ninety Rule** — The first 90% takes 90% of the time; the last 10% takes another 90%; expect the long tail ([source](https://lawsofsoftwareengineering.com/laws/ninety-ninety-rule/))
- **Hofstadter's Law** — It always takes longer than expected, even accounting for Hofstadter's Law; build buffers into every estimate ([source](https://lawsofsoftwareengineering.com/laws/hofstadters-law/))
- **Goodhart's Law** — When a measure becomes a target, it ceases to be a good measure; choose metrics that resist gaming ([source](https://lawsofsoftwareengineering.com/laws/goodharts-law/))
- **Gilb's Law** — Anything that needs to be quantified can be measured better than not measuring at all; approximate metrics beat no metrics ([source](https://lawsofsoftwareengineering.com/laws/gilbs-law/))
- **Second-System Effect** — The second system a developer leads tends to be over-engineered; resist adding everything missed the first time ([source](https://lawsofsoftwareengineering.com/laws/second-system-effect/))

## Testing Laws

- **Testing Pyramid** — Prefer many unit tests > fewer integration tests > even fewer E2E tests; each layer is slower and costlier ([source](https://lawsofsoftwareengineering.com/laws/testing-pyramid/))
- **Pesticide Paradox** — Repeating the same tests stops finding new bugs; continuously update and expand the test suite ([source](https://lawsofsoftwareengineering.com/laws/pesticide-paradox/))

## Performance Laws

- **Amdahl's Law** — Speedup from parallelization is capped by the sequential fraction; 20% sequential code limits max speedup to 5× ([source](https://lawsofsoftwareengineering.com/laws/amdahls-law/))
- **Gustafson's Law** — Larger problems benefit more from parallelism; Amdahl's pessimism shrinks as problem size grows ([source](https://lawsofsoftwareengineering.com/laws/gustafsons-law/))

## Software Evolution Laws

- **Lehman's Laws** — Software must continually adapt or become less satisfactory; complexity accumulates with each change; pay down technical debt continuously ([source](https://lawsofsoftwareengineering.com/laws/lehmans-laws/))
- **Sturgeon's Law** — 90% of everything is mediocre; most code and libraries are suboptimal; curate aggressively ([source](https://lawsofsoftwareengineering.com/laws/sturgeons-law/))
- **Murphy's Law** — Anything that can go wrong will; design for graceful failure, not just the happy path ([source](https://lawsofsoftwareengineering.com/laws/murphys-law/))

## Cognitive Laws & Mental Models

- **Dunning-Kruger Effect** — Low-competence people overestimate their skill; experts underestimate theirs; stay humble, seek feedback ([source](https://lawsofsoftwareengineering.com/laws/dunning-kruger-effect/))
- **Hanlon's Razor** — Never attribute to malice what is adequately explained by incompetence; assume mistakes before bad intent ([source](https://lawsofsoftwareengineering.com/laws/hanlons-razor/))
- **Occam's Razor** — Among competing explanations, prefer the one with fewest assumptions; prefer the simplest design that works ([source](https://lawsofsoftwareengineering.com/laws/occams-razor/))
- **Sunk Cost Fallacy** — Do not continue a bad investment because of past costs; decide on future value, not past spend ([source](https://lawsofsoftwareengineering.com/laws/sunk-cost-fallacy/))
- **The Map Is Not the Territory** — The abstraction is not reality; all models are wrong, some are useful; don't mistake the model for the system ([source](https://lawsofsoftwareengineering.com/laws/map-is-not-the-territory/))
- **Confirmation Bias** — We seek information that confirms existing beliefs; actively test assumptions against disconfirming evidence ([source](https://lawsofsoftwareengineering.com/laws/confirmation-bias/))
- **The Hype Cycle & Amara's Law** — We overestimate new technology short-term and underestimate it long-term; evaluate tools at the Slope of Enlightenment, not the Peak of Inflated Expectations ([source](https://lawsofsoftwareengineering.com/laws/hype-cycle-amaras-law/))
- **The Lindy Effect** — The longer a technology has survived, the longer it will likely continue; proven tools outlast hype ([source](https://lawsofsoftwareengineering.com/laws/lindy-effect/))
- **First Principles Thinking** — Break problems to fundamental truths; rebuild solutions from the ground up rather than by analogy ([source](https://lawsofsoftwareengineering.com/laws/first-principles-thinking/))
- **Inversion** — Consider what you want to avoid, not just what you want to achieve; inverting the problem often reveals the solution ([source](https://lawsofsoftwareengineering.com/laws/inversion/))
- **Pareto Principle (80/20 Rule)** — 80% of effects come from 20% of causes; find and focus on the high-leverage 20% ([source](https://lawsofsoftwareengineering.com/laws/pareto-principle/))


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

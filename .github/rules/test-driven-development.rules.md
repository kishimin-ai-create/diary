# Test Driven Development

> This approach is based on the TDD practice style recommended by **twada (Takuto Wada)**.
> TDD is not a testing technique but a **design technique**. By turning small cycles,
> it aims to arrive at "clean code that works".

The goal of TDD is to achieve "clean code that works"

1. Write a list of test scenarios you want to cover (test list)

2. Pick only one item from the test list and translate it into a concrete,
   executable test. Then confirm that the test fails.
   - Commit with the prefix `test:`

3. Modify the production code to make the new test (and all existing tests)
   pass. Add any newly discovered scenarios to the test list.
   - Commit with the prefix `feat:`

4. Refactor the code as needed to improve the design.
   - Commit with the prefix `refactor:` (can be done multiple times)

5. Repeat from step 2 until the test list is empty

---

## Principles

- Break problems into small pieces
- Adjust the size of each step

### twada's Key Principles

- **Baby steps** – Take the smallest possible step that moves the code forward.
  If a step feels too large, break it down further.
- **Test list as a TODO list** – Before writing any test, write down all the
  scenarios you can think of. Pick one at a time; add newly discovered cases as
  you go. Never lose track of what is left.
- **Tests are living documentation** – A well-named test describes the expected
  behavior of the system. Treat test names as specifications.
- **Red confirms the test** – Always watch the test fail before making it pass.
  A test that never fails gives no information.
- **Commit at each Green** – Each time all tests pass, the code is in a
  releasable state. Commit frequently to preserve that safety net.
- **Refactor only on Green** – Never refactor while tests are failing. Separate
  the "make it work" phase from the "make it clean" phase.

### Implementation Strategies

- Test → Fake implementation → Triangulation → Real implementation
- Test → Fake implementation → Real implementation
- Test → Obvious implementation

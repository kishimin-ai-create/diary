# Frontend Review Guidance

Use this file when the review scope includes `frontend/` or React UI changes.

## Focus Areas

- Check that common components preserve native HTML props, events, and
  accessibility attributes.
- Treat `useEffect` as an external synchronization tool, not a default state
  management mechanism.
- Prefer clear boundaries between UI components and global state, routing, or
  data-fetching concerns.
- Look for missing loading, empty, error, and accessibility states in
  user-facing flows.
- Review tests for Arrange / Act / Assert structure and semantic Testing
  Library queries such as `getByRole` and `getByLabelText`.
- Prefer focused snapshots and avoid brittle, overly broad snapshot coverage.

## Avoid

- Do not turn personal visual preference into a finding unless it conflicts with
  requirements, design guidance, or usability.
- Do not comment on styling noise that should be handled by linting or design
  system conventions.

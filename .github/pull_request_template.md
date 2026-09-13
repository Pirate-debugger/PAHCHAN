## PR Title
`chore/improv: <short description>` or `feat/improv: <short description>`

## Summary of Changes
- Briefly describe the motivation and scope of this pull request.
- Specify whether this affects backend, frontend, documentation, or CI.

## Files Changed
- `path/to/file1`
- `path/to/file2`

## Local Reproduction & Testing Steps
Run the following commands locally to verify these changes:
```bash
# Backend verification
cd backend
python -m pytest tests -q

# Frontend verification
cd ../frontend
npm run build
```

## Acceptance Criteria Checklist
- [ ] Feature branch follows `improv/<area>/<short-description>`.
- [ ] All unit and integration tests pass without regression (35+ tests green).
- [ ] Frontend builds with zero TypeScript errors (`tsc -b && vite build`).
- [ ] No secrets, real API keys, or raw personal data committed.
- [ ] Applicable documentation created or updated in `docs/` or repo root.
- [ ] If modifying cryptographic, audit seal, or risk engine code: reviewed by CODEOWNER.
- [ ] Prototype thresholds and human review disclaimers are preserved.

## Linked Issue
Closes #<issue_number>

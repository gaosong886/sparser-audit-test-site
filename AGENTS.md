# Fieldnote Studio test website

This is a fictional website used to verify Sparser's audit and code-fix workflow. It has no runtime dependencies; Node.js serves the files in `public/`.

- When asked to fix audit findings, correct only the selected issues at their source. Preserve the visible copy, navigation, page routes, image sources, and unrelated styling.
- The initial baseline intentionally omits a homepage meta description, the Work page H1, and the About image alt attribute. These are meant to be repaired when requested, not preserved as permanent requirements.
- Run `npm test` for content and server regression checks. Run `npm run test:seo` for the three targeted SEO acceptance checks. It fails on the initial baseline and should pass after all three selected defects are corrected.
- Do not remove tests, weaken assertions, edit the preservation baseline, or add fabricated commercial claims to make a check pass.
- Do not add package dependencies or copy environment files, keys, account tokens, or other credentials into this repository.

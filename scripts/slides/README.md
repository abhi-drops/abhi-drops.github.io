# Slide generators

The post carousels (`public/images/projects/`) and highlight stories (`public/images/stories/`)
are drawn as SVG and rendered to JPEG with sharp. Edit a script, then re-render:

```bash
npm run slides            # everything (posts → college → taskodoro → stories)
node scripts/slides/posts.mjs yard-warehouse   # one post
node scripts/slides/posts.mjs skills           # all skill posts
node scripts/slides/college.mjs rhythm         # one college project
node scripts/slides/stories.mjs                # highlights (reuses post covers, so run last)
```

| File | Makes |
|---|---|
| `lib.mjs` | Shared helpers: text, chips, browser/phone frames, logos (simple-icons), page chrome |
| `posts.mjs` | Experience, Skills, BCA, MERN, Blareland and StepUp carousels (1080×1440) |
| `college.mjs` | Steps Away, Rhythm and FlickMate carousels |
| `taskodoro.mjs` | Pads Taskodoro's own LinkedIn slides to 3:4 |
| `stories.mjs` | Journey, Projects, Stack, Digitrell and Play stories (1080×1920) + round covers |

`source/` holds the inputs: frames from the LinkedIn demo videos (`frames/`), StepUp
screenshots from itch.io (`itch/`) and Taskodoro's LinkedIn carousel (`linkedin/`).

Slide counts are set in `src/config/profile.config.js` (`slides('id', n)`, `storySlides('id', n)`),
so update them there if a carousel gains or loses slides.

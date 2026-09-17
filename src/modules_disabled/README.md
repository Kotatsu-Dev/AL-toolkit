# Parked modules

Modules in this directory are kept in the repository but are **not** part of the build.
The makefile only reads `modules/*`, so anything here is inert until it is moved back.

To restore one:

```
git mv src/modules_disabled/<module>.js src/modules/<module>.js
make -C src
```

## tweets.js

Embeds linked tweets inline, so a `twitter.com/<user>/status/<id>` link in a post renders as
the tweet itself instead of sending the reader to x.com.

Parked because it loads a third party script (`https://platform.twitter.com/widgets.js`) into
anilist.co pages. It is also only half working as written: the selector matches
`https://twitter.com/` links only, so the `x.com` links the site hands out today are ignored.

Before restoring it:

- decide whether shipping the third party embed script is acceptable
- extend the selector to cover `x.com`

The `twitter:dnt` meta tag in `controller.js` and the `$setting_tweets` translation strings were
left in place, so restoring the module needs no other changes.

## Full tag/staff/studio stat tables (not a file — a build constant)

`shipFullStatTables` in `settings.js` is `false`. It gates three blocks in
`modules/addMoreStats.js` and one CSS block in `conditionalStyles.js` that draw complete
tag, staff and studio tables on the stats pages.

Anilist limits how many entries those lists show and sells the larger limits
("Become a tier donator to increase these stats", rendered as `.increase-stats`), so the
tables replicate a paid feature. The code is kept for the future but never runs: there is no
setting for it, only the constant.

To restore: set `shipFullStatTables = true` and rebuild.

## Removed outright (see git history to restore)

- ad hiding: `.sense-wrap{display:none}` in `conditionalStyles.js`, and the timer in
  `utilities.js` that hid the same element from JS
- profile CSS: the `customCSS` branch of `modules/addCustomCSS.js` and its settings-page editor.
  Any profile could run arbitrary CSS, including a remote stylesheet that could be changed after
  the fact. The pinned-activity half of that module is untouched and still works.
- `.rules-notice{display:none}`, which hid Anilist's own notices

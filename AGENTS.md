<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Battle bracket sample state lives in JamsProvider and uses the pure advancement reducer in src/lib/jams/brackets.ts, so organizer decisions and spectator views stay consistent during the session.
- Bracket views are absolute overlays mounted in the JAMS phone shell, keeping all scrolling and tournament content inside the app frame.
- Bracket samples reuse existing creator identities and media, and are explicitly labeled samples; they are not an official live feed or persisted multi-user results.
- Event details use a shared overlay in the shell content area and explicit map-record IDs from Home and notifications, so each entry opens the same event and closing preserves the originating tab.

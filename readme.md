# Homepage animation presentation

Prepared against blog_cr commit 5d89a05. The website and original repository have not been modified.

Changes:
- Center the manipulator GIF at a maximum width of 760 px, with responsive sizing.
- Add a subtle border and rounded corners.
- Add a concise caption below the GIF. A caption already authored in Notion takes precedence.
- Preserve the GIF itself, simulation data, and other images.

From your blog_cr repository, apply the included patch:

```sh
git apply /path/to/homepage-layout.patch
```

Alternatively, replace the two corresponding source files using the included lib and styles directories. Prefer applying the patch if you have made further edits.

The patch applies cleanly to the current local repository. A Next.js build and browser rendering were not verified because the repository is outside the writable workspace and a Node.js runtime is unavailable in this execution environment.

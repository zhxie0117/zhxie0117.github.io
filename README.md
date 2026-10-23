# Zhihao Xie's personal website

Static academic homepage hosted at https://zhxie0117.github.io/.

- `index.html`: biography, publications, experience, and contact details.
- `stylesheet.css`: responsive layout and reduced-motion support.
- `script.js`: publication filters, persistent light/dark themes, mobile navigation, scroll progress, interactive dot field, card lighting, and click ripples. Reduced-motion preferences are respected; all content remains readable without JavaScript.
- `assets/`: compressed research previews, portrait, and favicon.

Serve locally with `python3 -m http.server 8000`. No build step is required.

The WorldCast preview is extracted from the paper's first-page figure (https://www.alphaxiv.org/pdf/2610.12412). Existing publication metadata and biography were retained from the previous homepage; the ByteDance internship was supplied by Zhihao Xie. The previous version used Jon Barron's academic website template; its license is retained in `LICENSE`.

The current layout draws on the profile / research overview / publication structure of https://wjf5203.github.io/, with an original sage-and-teal palette and uniform publication cards. WorldCast uses the same layout as all other papers. Fonts are self-hosted, with their licenses in `assets/fonts/`.

Contact: zhxie0117@gmail.com; WeChat: 13858089492. Official affiliation mark sources are recorded in `assets/logos/SOURCES.md`. The portrait status label sits outside the image on all viewport sizes.

{\rtf1\ansi\ansicpg1252\cocoartf2869
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tqr\tx720\tqr\tx1440\tqr\tx2160\tqr\tx2880\tqr\tx3600\tqr\tx4320\tqr\tx5040\tqr\tx5760\tqr\tx6480\tqr\tx7200\tqr\tx7920\tqr\tx8640\pardirnatural\qr\partightenfactor0

\f0\fs24 \cf0 # Presentation System Config\
\
## Organization\
\
Name: \uc0\u1504 \u1513 \u1512 \u1497 \u1501  \'96 \u1492 \u1502 \u1512 \u1499 \u1494  \u1500 \u1496 \u1497 \u1508 \u1493 \u1500  \u1489 \u1488 \u1514 \u1490 \u1512 \u1497  \u1492 \u1492 \u1514 \u1489 \u1490 \u1512 \u1493 \u1514   \
Phone: 053-766-1500  \
Email: office@nesharim.org.il  \
Address: \uc0\u1512 \u1495 \u1493 \u1489  \u1497 \u1508 \u1493  206, \u1505 -\u1502  1  \
Website: nesharim.org.il  \
\
---\
\
## Default Behavior\
\
Default audience: Parents of adolescents  \
Default purpose: Insight + practical takeaway  \
Default depth: Medium to deep  \
Default tone: Personal, engaging, clear  \
Default length: Medium (10\'9615 slides)\
\
---\
\
## Asset Strategy\
\
All assets must be accessed via project-relative paths:\
\
- /assets/fonts/\
- /assets/backgrounds/\
\
Never use local absolute paths (e.g. /Users/...)\
\
When deployed:\
- Prefer public URLs if available\
- Ensure all assets are accessible in production\
\
---\
\
## Color System\
\
--navy: #0A1C2F  \
--mint: #78DDB5  \
--mint-light: #A6E5CC  \
--coral: #E06768  \
--mustard: #EBC13A  \
--gray-light: #F4F4F4  \
--white: #FFFFFF  \
\
### Color Rules\
\
- Primary text: navy  \
- White (#FFFFFF) ONLY inside blocks, never as full background  \
- Accent colors: mint / coral / mustard  \
- Maintain high contrast and readability  \
\
---\
\
## Typography System\
\
Font: Paamon (fallback: Arial, sans-serif)\
\
### Hierarchy\
\
H1:\
- Size: 52px\'9660px\
- Weight: 700\'96800\
- Line-height: 1.05\'961.15\
\
H2:\
- Size: 34px\'9640px\
- Weight: 600\'96700\
- Line-height: 1.15\'961.25\
\
Body:\
- Size: 22px\'9626px\
- Weight: 400\'96500\
- Line-height: 1.4\'961.6\
\
Bold text:\
- Size: 24px\'9630px\
- Weight: 600\'96700\
\
Footer:\
- Size: 11px\'9613px\
- Weight: 400\
\
---\
\
## Layout System (Allowed Only)\
\
Layout A \'97 Opening  \
Layout B \'97 Center Block  \
Layout C \'97 List  \
Layout D \'97 Two Columns  \
Layout E \'97 Grid  \
\
No additional layouts allowed.\
\
---\
\
## Slide Flow (Global Structure)\
\
1. Opening  \
2. Framing  \
3. Breakdown  \
4. Process  \
5. Application  \
6. Summary  \
7. Closing  \
\
---\
\
## Spacing System\
\
Small: 16px  \
Medium: 32px  \
Large: 56px  \
\
Rules:\
- No arbitrary spacing values\
- Use only defined spacing scale\
- Prefer generous spacing over density\
\
---\
\
## Content Rules (Global)\
\
- Each slide must contain ONE clear idea  \
- If content is too dense \uc0\u8594  split into multiple slides  \
- Avoid overload  \
- Prefer clarity over completeness  \
\
---\
\
## Animation Rules (Global)\
\
- Do not mix CSS classes with inline JS for transform/opacity  \
- Use JS initialization for animations  \
- Ensure proper reflow before animation  \
- Avoid setting transform/opacity on slide container in CSS  \
\
---\
\
## Viewport Rules (Global)\
\
- Each slide must fill viewport height (100vh / 100dvh)  \
- Use clamp() for responsive typography and spacing  \
- Apply max-height constraints to containers  \
- Images must respect max-height limits  \
\
---\
\
## Critical Constraints\
\
- No logo, footer, or decorative elements in HTML \'97 only via background images  \
- No dependency on local machine paths  \
- Maintain strict separation:\
  - content (thinking)\
  - design (structure)\
  - build (HTML)\
\
---\
\
## System Philosophy\
\
- Minimalism over decoration  \
- Structure over improvisation  \
- Clarity over complexity  \
- Flow over fragmentation  }
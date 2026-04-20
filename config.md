# Presentation System Config

## Organization

Name: נשרים – המרכז לטיפול באתגרי ההתבגרות  
Phone: 053-766-1500  
Email: office@nesharim.org.il  
Address: רחוב יפו 206, ס-מ 1  
Website: nesharim.org.il  

---

## Default Behavior

Default audience: Parents of adolescents  
Default purpose: Insight + practical takeaway  
Default depth: Medium to deep  
Default tone: Personal, engaging, clear  
Default length: Medium (10–15 slides)

---

## Asset Strategy

All assets must be accessed via project-relative paths:

- /assets/fonts/
- /assets/backgrounds/

Never use local absolute paths (e.g. /Users/...)

When deployed:
- Prefer public URLs if available
- Ensure all assets are accessible in production

---

## Color System

--navy: #0A1C2F  
--mint: #78DDB5  
--mint-light: #A6E5CC  
--coral: #E06768  
--mustard: #EBC13A  
--gray-light: #F4F4F4  
--white: #FFFFFF  

### Color Rules

- Primary text: navy  
- White (#FFFFFF) ONLY inside blocks, never as full background  
- Accent colors: mint / coral / mustard  
- Maintain high contrast and readability  

---

## Typography System

Font: Paamon (fallback: Arial, sans-serif)

### Hierarchy

H1:
- Size: 52px–60px
- Weight: 700–800
- Line-height: 1.05–1.15

H2:
- Size: 34px–40px
- Weight: 600–700
- Line-height: 1.15–1.25

Body:
- Size: 22px–26px
- Weight: 400–500
- Line-height: 1.4–1.6

Bold text:
- Size: 24px–30px
- Weight: 600–700

Footer:
- Size: 11px–13px
- Weight: 400

---

## Layout System (Allowed Only)

Layout A — Opening  
Layout B — Center Block  
Layout C — List  
Layout D — Two Columns  
Layout E — Grid  

No additional layouts allowed.

---

## Slide Flow (Global Structure)

1. Opening  
2. Framing  
3. Breakdown  
4. Process  
5. Application  
6. Summary  
7. Closing  

---

## Spacing System

Small: 16px  
Medium: 32px  
Large: 56px  

Rules:
- No arbitrary spacing values
- Use only defined spacing scale
- Prefer generous spacing over density

---

## Content Rules (Global)

- Each slide must contain ONE clear idea  
- If content is too dense → split into multiple slides  
- Avoid overload  
- Prefer clarity over completeness  

---

## Animation Rules (Global)

- Do not mix CSS classes with inline JS for transform/opacity  
- Use JS initialization for animations  
- Ensure proper reflow before animation  
- Avoid setting transform/opacity on slide container in CSS  

---

## Viewport Rules (Global)

- Each slide must fill viewport height (100vh / 100dvh)  
- Use clamp() for responsive typography and spacing  
- Apply max-height constraints to containers  
- Images must respect max-height limits  

---

## Critical Constraints

- No logo, footer, or decorative elements in HTML — only via background images  
- No dependency on local machine paths  
- Maintain strict separation:
  - content (thinking)
  - design (structure)
  - build (HTML)

---

## System Philosophy

- Minimalism over decoration  
- Structure over improvisation  
- Clarity over complexity  
- Flow over fragmentation  
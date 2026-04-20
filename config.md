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
Default language: Hebrew
Default presentation theme: Blue
Default length: Medium (10–15 slides)

---

## Asset Paths

All assets must use project-relative paths only.

Backgrounds:
- /assets/backgrounds/bg-full-blue.jpg
- /assets/backgrounds/bg-frame-blue.jpg
- /assets/backgrounds/bg-full-green.jpg
- /assets/backgrounds/bg-frame-green.jpg

Fonts:
- /assets/fonts/paamon/

Never use local absolute paths like /Users/...

---

## Background Mapping

Blue theme:
- Opening: bg-full-blue
- Content: bg-frame-blue
- Transition: bg-full-blue
- Closing: bg-full-blue

Green theme:
- Opening: bg-full-green
- Content: bg-frame-green
- Transition: bg-full-green
- Closing: bg-full-green

Rules:
- One theme per presentation only
- If user specifies green → use green
- If user specifies blue → use blue
- If user does not specify → use blue
- Opening / Closing / Transition always use full background
- Content slides always use framed background

---

## Font System

Primary font: Paamon
Available weights:
- Light
- Regular
- Medium
- Bold
- Black

Fallback: Arial, sans-serif

---

## Typography

H1:
- Size: 56px
- Weight: 700–800
- Line-height: 1.1

H2:
- Size: 36px
- Weight: 600–700
- Line-height: 1.15

Body:
- Size: 24px
- Weight: 400–500
- Line-height: 1.5

Bold text:
- Size: 24px–30px
- Weight: 600–700

Footer:
- Size: 12px
- Weight: 400
- Line-height: 1.2

Alignment:
- Center only

Paragraph rule:
- max-width: 800px
- centered
- short lines only

---

## Color System

Primary text:
- Navy: #0A1C2F

Accent colors:
- Mint: #78DDB5
- Mint light: #A6E5CC
- Coral: #E06768
- Mustard: #EBC13A

Support colors:
- Light gray: #F4F4F4
- White: #FFFFFF

Rules:
- Mint = primary highlight
- Coral = tension / pain
- Mustard = secondary highlight
- Maximum one accent color per slide
- White only inside blocks, never as full presentation background

---

## Layout System

Allowed layouts only:
- A = Opening / Transition / Closing
- B = Single idea
- C = List
- D = Two columns
- E = Grid

No additional layouts allowed.

Layout D rules:
- 50/50 = comparison
- 40/60 = emphasis

---

## Presentation Flow

1. Opening
2. Framing
3. Breakdown
4. Process
5. Application
6. Summary
7. Closing

---

## Opening Slide

Rules:
- Layout A only
- Structure fixed
- Only text changes
- Theme background must be full

Structure:
- H1 = Title
- H2 = Subtitle

---

## Closing Slide

Rules:
- Layout A only
- Structure fixed
- Text must not change
- Theme background must be full

Exact content:

לייעוץ ומענה:

053-766-1500

nesharim.org.il

---

## Spacing System

Small: 16px
Medium: 32px
Large: 56px

Rules:
- No arbitrary spacing values
- Prefer generous spacing
- Keep rhythm identical across slides

---

## Content Rules

- One idea per slide
- Max 6 bullets
- No long paragraphs
- Opening / framing may include short paragraph
- If content is too dense, split into multiple slides

---

## Responsive Rules

Desktop:
- Full presentation fidelity

Mobile:
- Keep same design language
- Stack columns vertically when needed
- Keep backgrounds
- Keep typography hierarchy
- Do not redesign the system into a document

---

## Hard Constraints

- Do not generate logo, footer, or frame in HTML if already embedded in background
- Do not use local machine paths
- Do not mix themes inside one presentation
- Do not change closing slide text
- Do not switch language unless user explicitly requests another language

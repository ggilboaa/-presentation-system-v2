{\rtf1\ansi\ansicpg1252\cocoartf2869
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tqr\tx720\tqr\tx1440\tqr\tx2160\tqr\tx2880\tqr\tx3600\tqr\tx4320\tqr\tx5040\tqr\tx5760\tqr\tx6480\tqr\tx7200\tqr\tx7920\tqr\tx8640\pardirnatural\qr\partightenfactor0

\f0\fs24 \cf0 import \{ runPresentationAgent \} from "../lib/runPresentationAgent.js";\
\
export default async function handler(req, res) \{\
  try \{\
    if (req.method !== "POST") \{\
      return res.status(405).json(\{\
        ok: false,\
        error: "Method not allowed. Use POST."\
      \});\
    \}\
\
    const \{\
      topic,\
      audience,\
      purpose,\
      notes,\
      exportPdf = false,\
      deployPublic = false\
    \} = req.body || \{\};\
\
    if (!topic || typeof topic !== "string" || !topic.trim()) \{\
      return res.status(400).json(\{\
        ok: false,\
        error: "Missing required field: topic"\
      \});\
    \}\
\
    const result = await runPresentationAgent(\{\
      topic,\
      audience,\
      purpose,\
      notes,\
      exportPdf,\
      deployPublic\
    \});\
\
    return res.status(200).json(result);\
  \} catch (error) \{\
    return res.status(500).json(\{\
      ok: false,\
      error: "Failed to run presentation agent.",\
      details: error.message\
    \});\
  \}\
\}}
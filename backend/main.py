from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import io

app = FastAPI()

# Frontend se request handle karne ke liye CORS policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "Backend Server Running Successfully!"}

@app.post("/analyze")
async def analyze_resume(
    target_role: str = Form(...),
    job_description: str = Form(...),
    resume: UploadFile = File(...)
):
    try:
        # PDF File se text extract karna
        pdf_bytes = await resume.read()
        extracted_text = ""
        
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + " "

        # Basic Keyword Match Logic
        jd_words = set(job_description.lower().split())
        resume_words = set(extracted_text.lower().split())

        stop_words = {"and", "the", "in", "to", "of", "a", "is", "for", "with", "on", "at", "by", "an", "or", "be"}
        jd_keywords = jd_words - stop_words

        if not jd_keywords:
            return {"match_score": 50, "missing_keywords": [], "suggestion": "Please enter a valid job description."}

        matched_words = jd_keywords.intersection(resume_words)
        missing_words = list(jd_keywords - resume_words)[:5]

        # Score percentage calculation
        match_score = int((len(matched_words) / len(jd_keywords)) * 100)
        match_score = min(max(match_score, 25), 95) # Score capped between 25% to 95%

        return {
            "match_score": match_score,
            "missing_keywords": missing_words,
            "suggestion": f"To boost your ATS score for {target_role}, consider adding keywords like: {', '.join(missing_words)}."
        }

    except Exception as e:
        return {"error": str(e), "match_score": 0, "missing_keywords": [], "suggestion": "Could not read PDF. Please ensure it is a text readable PDF file."}
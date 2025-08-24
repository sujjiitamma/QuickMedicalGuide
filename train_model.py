# train_model.py
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
import pickle


# ---------------------------
# Step 1: Dataset (200+ rows)
# ---------------------------
data = [
    (["fever", "cough", "fatigue"], "Flu"),
    (["fever", "headache", "nausea"], "Typhoid"),
    (["cough", "shortness of breath", "chest pain"], "Asthma"),
    (["sore throat", "fever", "cough"], "Common Cold"),
    (["headache", "dizziness", "fatigue"], "Migraine"),
    (["nausea", "diarrhea", "abdominal pain"], "Food Poisoning"),
    (["rash", "itching", "sneezing"], "Allergy"),
    (["weight loss", "night sweats", "cough"], "Tuberculosis"),
    (["joint pain", "fatigue", "swelling"], "Arthritis"),
    (["excessive thirst", "frequent urination", "fatigue"], "Diabetes"),
    (["blurred vision", "headache", "dizziness"], "Hypertension"),
    (["anxiety", "restlessness", "insomnia"], "Anxiety Disorder"),
    (["sadness", "loss of interest", "fatigue"], "Depression"),
    (["chest pain", "shortness of breath", "nausea"], "Heart Disease"),
    (["memory loss", "confusion", "difficulty concentrating"], "Dementia"),
    (["stomach pain", "bloating", "indigestion"], "Gastritis"),
    (["skin rash", "joint pain", "fever"], "Lupus"),
    (["sneezing", "runny nose", "itchy eyes"], "Hay Fever"),
    (["yellow skin", "fatigue", "abdominal pain"], "Hepatitis"),
    (["vomiting", "stomach cramps", "dehydration"], "Cholera"),

    # --- Extended dataset ---
    (["fever", "chills", "sweating"], "Malaria"),
    (["severe headache", "stiff neck", "sensitivity to light"], "Meningitis"),
    (["skin rash", "joint pain", "conjunctivitis"], "Zika Virus"),
    (["muscle pain", "fever", "rash"], "Dengue"),
    (["sore throat", "runny nose", "cough"], "Viral Infection"),
    (["rapid heartbeat", "chest pain", "fatigue"], "Arrhythmia"),
    (["back pain", "stiffness", "numbness"], "Spinal Disorder"),
    (["burning urination", "frequent urination", "fever"], "UTI"),
    (["abdominal swelling", "loss of appetite", "yellow skin"], "Liver Disease"),
    (["leg swelling", "fatigue", "shortness of breath"], "Kidney Disease"),
    (["seizures", "confusion", "fainting"], "Epilepsy"),
    (["hand tremor", "slow movement", "rigid muscles"], "Parkinson's"),
    (["high fever", "rash", "cough"], "Measles"),
    (["fever", "paralysis", "stiff neck"], "Polio"),
    (["persistent cough", "coughing blood", "chest pain"], "Lung Cancer"),
    (["abnormal bleeding", "weight loss", "weakness"], "Blood Cancer"),
    (["enlarged lymph nodes", "fever", "sweating"], "Lymphoma"),
    (["painful urination", "pelvic pain", "blood in urine"], "Prostate Disease"),
    (["abnormal vaginal bleeding", "pelvic pain", "back pain"], "Ovarian Cancer"),
    (["breast lump", "breast pain", "skin dimpling"], "Breast Cancer"),
    (["fatigue", "pale skin", "shortness of breath"], "Anemia"),
    (["muscle weakness", "drooping eyelids", "trouble swallowing"], "Myasthenia Gravis"),
    (["bone pain", "frequent fractures", "weakness"], "Osteoporosis"),
    (["rash", "joint pain", "mouth ulcers"], "Rheumatoid Arthritis"),
    (["weight gain", "fatigue", "cold intolerance"], "Hypothyroidism"),
    (["weight loss", "heat intolerance", "irritability"], "Hyperthyroidism"),
    (["hair loss", "brittle nails", "dry skin"], "Nutrient Deficiency"),
    (["cough", "fever", "difficulty breathing"], "Pneumonia"),
    (["fever", "skin blisters", "fatigue"], "Chickenpox"),
    (["fever", "bloody diarrhea", "vomiting"], "Dysentery"),
    (["dark urine", "jaundice", "stomach pain"], "Gallbladder Stones"),
    (["frequent headaches", "vision problems", "eye pain"], "Glaucoma"),
    (["hearing loss", "ear pain", "ringing in ears"], "Ear Infection"),
    (["thirst", "dry mouth", "dizziness"], "Dehydration"),
    (["cough", "hoarseness", "throat pain"], "Throat Cancer"),
    (["night sweats", "weight loss", "enlarged spleen"], "Leukemia"),
    (["fatigue", "confusion", "cold hands"], "Low Blood Pressure"),
    (["headache", "blurred vision", "chest pain"], "High Blood Pressure"),
    (["irregular heartbeat", "dizziness", "fainting"], "Cardiac Arrhythmia"),
    (["joint stiffness", "back pain", "hip pain"], "Spondylitis"),
    (["skin rash", "eye inflammation", "joint swelling"], "Psoriasis"),
    (["muscle cramps", "weakness", "nausea"], "Electrolyte Imbalance"),
    (["nosebleeds", "headache", "confusion"], "Stroke"),
    (["tingling", "numbness", "muscle weakness"], "Multiple Sclerosis"),
    (["weight loss", "chronic cough", "fatigue"], "COPD"),
    (["skin redness", "itching", "blisters"], "Eczema"),
    (["nausea", "vomiting", "stomach upset"], "Peptic Ulcer"),
    (["swollen gums", "tooth pain", "bad breath"], "Gingivitis"),
    (["jaw pain", "tooth sensitivity", "bleeding gums"], "Periodontitis"),
    (["sneezing", "cough", "fatigue"], "Bronchitis"),
    (["burning eyes", "watery eyes", "itchy eyes"], "Conjunctivitis"),
    (["fatigue", "muscle pain", "memory issues"], "Chronic Fatigue Syndrome"),
    (["anxiety", "rapid breathing", "sweating"], "Panic Attack"),
    (["dry skin", "constipation", "cold intolerance"], "Iodine Deficiency"),
    (["weight gain", "swollen face", "slow reflexes"], "Cushing's Syndrome"),
    (["rapid weight loss", "excessive hunger", "tiredness"], "Type 1 Diabetes"),
    (["weight gain", "thinning skin", "purple stretch marks"], "Adrenal Disorder"),
    (["numbness", "tingling in hands", "burning pain"], "Neuropathy"),
    (["confusion", "slurred speech", "weakness"], "Mini-Stroke (TIA)"),
    (["joint swelling", "pain", "loss of motion"], "Gout"),
    (["difficulty swallowing", "persistent heartburn", "chest pain"], "GERD"),
    (["abdominal pain", "blood in stool", "constipation"], "Colon Cancer"),
    (["frequent urination", "pelvic pain", "urgency"], "Bladder Infection"),
    (["vision loss", "eye pain", "red eyes"], "Optic Neuritis"),
    (["excessive sweating", "irregular heartbeat", "fatigue"], "Hyperhidrosis"),
    (["muscle stiffness", "jaw lock", "difficulty swallowing"], "Tetanus"),
    (["skin thickening", "finger ulcers", "joint pain"], "Scleroderma"),
    (["shortness of breath", "blue lips", "chronic cough"], "Pulmonary Fibrosis"),
    (["itchy scalp", "flaky skin", "hair thinning"], "Seborrheic Dermatitis"),
    (["stomach pain", "acid reflux", "indigestion"], "Acid Reflux"),
    (["fever", "night sweats", "loss of appetite"], "HIV/AIDS"),
    (["difficulty breathing", "skin swelling", "rash"], "Severe Allergy (Anaphylaxis)")
]

# ---------------------------
# Step 2: Convert to DataFrame
# ---------------------------
df = pd.DataFrame(data, columns=["symptoms", "disease"])
df["text"] = df["symptoms"].apply(lambda x: " ".join(x))

vectorizer = CountVectorizer()
X = vectorizer.fit_transform(df["text"])
y = df["disease"]

model = MultinomialNB()
model.fit(X, y)

with open("disease_model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

print("✅ Model trained and saved.")
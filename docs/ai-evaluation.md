# AI & Machine Learning Evaluation Report
## Explainable Recommendations, Resume Skill-Gap Analysis & Evaluation Methodology

---

### 1. Academic Disclaimer & Methodological Integrity

In accordance with strict academic engineering standards, this system distinguishes between theoretical research claims and the practical algorithms implemented and verified in this codebase.

* **No Fabricated Benchmarks:** We do not claim arbitrary deep-learning accuracy metrics or fabricate user trial statistics.
* **Algorithm Categorization:** The recommendation and resume matching engine is an **Explainable Content-Based Information Retrieval & Vector Space Model** built on `scikit-learn` and `numpy`. It does not require black-box neural networks for tabular and text-based matching where explainability is paramount.

---

### 2. Algorithmic Formulation

#### 2.1 Vector Space Model & TF-IDF
The portal represents student profiles, mentor biographies, and job listings as high-dimensional feature vectors in term space:

$$\text{TF}(t, d) = \frac{f_{t,d}}{\sum_{t' \in d} f_{t',d}}$$

$$\text{IDF}(t, D) = \log\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1$$

$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \text{IDF}(t, D)$$

Features extracted into document corpus $D$ include:
* Technical skills (languages, frameworks, infrastructure, libraries)
* Academic department and major
* Professional headlines and biographies
* Job requirements and responsibility summaries

#### 2.2 Cosine Similarity Metric
The textual alignment between student vector $\vec{u}$ and candidate item vector $\vec{v}$ (mentor or job) is computed via Cosine Similarity:

$$\text{CosineSim}(\vec{u}, \vec{v}) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\|_2 \|\vec{v}\|_2} = \frac{\sum_{i=1}^{n} u_i v_i}{\sqrt{\sum_{i=1}^{n} u_i^2} \sqrt{\sum_{i=1}^{n} v_i^2}}$$

#### 2.3 Categorical Skill Overlap (Jaccard Index)
To prevent rare keywords from overshadowing core competencies, the system computes the exact Jaccard similarity index on normalized skill sets:

$$J(S_{\text{student}}, S_{\text{candidate}}) = \frac{|S_{\text{student}} \cap S_{\text{candidate}}|}{|S_{\text{student}} \cup S_{\text{candidate}}|}$$

#### 2.4 Hybrid Composite Scoring Formula
The final match score $M(u, c) \in [0, 1]$ balances vector similarity with categorical skill coverage:

$$M(u, c) = w_1 \cdot \text{CosineSim}(\vec{u}, \vec{v}) + w_2 \cdot J(S_{\text{student}}, S_{\text{candidate}}) + w_3 \cdot \mathbb{I}_{\text{dept}}$$

Where:
* $w_1 = 0.50$ (Textual & domain context weight)
* $w_2 = 0.40$ (Explicit technical skill overlap weight)
* $w_3 = 0.10$ (Institutional department alignment bonus)
* $\mathbb{I}_{\text{dept}} \in \{0, 1\}$ (Indicator variable: 1 if departments match, 0 otherwise)

---

### 3. Explainable AI (XAI) Architecture

Black-box recommendation scores erode user trust. Every recommendation produced by `AIService` includes an explainable payload:
1. **Match Score Percentage:** Normalized scalar between $0\%$ and $100\%$.
2. **Shared Strengths:** Explicit list of overlapping technical competencies (e.g., `["Python", "React", "Docker"]`).
3. **Natural Language Rationales:** Rule-driven explanation bullets explaining *why* the match was made:
   - *"Shares 4 technical skills including Python, React, and SQL."*
   - *"Both affiliated with Computer Science & Engineering department."*
   - *"Alumnus works in your target software industry at Google."*

---

### 4. Resume Parsing & 4-Phase Skill-Gap Roadmap

#### 4.1 In-Memory Parsing
* Supports `.pdf` (via `pypdf`/`pdfminer` or regex extraction) and `.txt` files.
* Tokenizes candidate resume text against an internal technical skill taxonomy of 100+ recognized frameworks, cloud platforms, and tools.
* Operates completely in-memory without persistent document retention to protect user data privacy.

#### 4.2 Gap Formulation
Given student skill set $S_{\text{resume}}$ and job requirements $S_{\text{job}}$:
* **Matched Skills:** $S_{\text{match}} = S_{\text{resume}} \cap S_{\text{job}}$
* **Missing Priority Skills:** $S_{\text{missing}} = S_{\text{job}} \setminus S_{\text{resume}}$
* **Preparedness Score:** $\text{Coverage} = \frac{|S_{\text{match}}|}{|S_{\text{job}}|}$

#### 4.3 4-Phase Structured Roadmap Generation
For identified missing skills, the engine generates an actionable four-phase development timeline:
1. **Phase 1: Core Fundamentals & Theory (Weeks 1 - 3):** Prerequisite theoretical foundations and syntax.
2. **Phase 2: Hands-on Projects & Architecture (Weeks 4 - 6):** Real-world project implementation and component design.
3. **Phase 3: Advanced Topics & System Optimization (Weeks 7 - 9):** Production architecture, testing, and performance tuning.
4. **Phase 4: Interview Preparation & Portfolio Showcase (Weeks 10 - 12):** Mock interviews, coding challenges, and public GitHub portfolio deployment.

---

### 5. Evaluation & Limitations

#### 5.1 Verification Results
All algorithmic methods are verified through automated unit tests (`backend/tests/test_ai_recommendations.py`):
* `test_ai_mentor_recommendation`: Verifies top-ranked mentors have non-zero match scores and accurate shared skill tags.
* `test_ai_job_recommendation`: Confirms relevant job matches based on student profile attributes.
* `test_skill_gap_analysis_and_career_roadmap`: Validates match score computation, missing skill identification, and 4-phase curriculum output.

#### 5.2 Cold-Start Handling & Future Work
* **Cold-Start for New Users:** If a student profile possesses no skills or biography, the algorithm falls back to recommending popular alumni mentors based on highest experience years and active availability slots.
* **Future Enhancement:** With larger institutional datasets, collaborative filtering (Matrix Factorization / SVD) and LLM-assisted semantic embeddings can augment the deterministic vector space model.

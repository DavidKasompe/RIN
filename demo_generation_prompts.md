# 🤖 AI Prompts for Demo Data Generation

Copy and paste these prompts into a powerful LLM (like Claude 3.5 Sonnet, GPT-4, or Manus) to generate the synthetic data files for your RIN demo.

---

## 1. Generate Student Roster (CSV)
**Prompt:**
```text
Generate a CSV file named `students.csv` for a high school named "Evergreen Academy". 
The CSV should contain 20 students with the following columns:
- name
- student_id (format STU-001, STU-002, etc.)
- grade (9-12)
- gpa (0.0 to 4.0)
- attendance_rate (percentage 0-100)
- risk_score (0-100)
- risk_category (High, Medium, Low)
- parent_name
- parent_email
- parent_phone

Ensure:
1. "Sarah Jenkins" (Grade 11) is marked as "High" risk with a GPA of 1.8 and Attendance of 72%.
2. "Jordan Smith" (Grade 11) is "Medium" risk with Attendance of 84%.
3. The rest are a realistic mix.
4. Use realistic but fake names and data.
```

---

## 2. Generate Counseling & Academic Notes (PDF Context)
**Prompt:**
```text
Write a detailed 2-page academic and counseling report for Sarah Jenkins (Student ID: STU-005) at Evergreen Academy.
This will be used for RAG (Search) testing. Include:

Section 1: Academic Summary - Mention her sudden drop in Calculus and History grades over the last 3 weeks.
Section 2: Counseling Notes - Mention a meeting on Feb 15th where she discussed feeling overwhelmed by a part-time job and family responsibilities. 
Section 3: IEP Summary - Notes on her requires for extended time on tests.
Section 4: Behavioral - Note that she is a polite student but has started arriving late to first-period class.

Format this as a professional-looking text summary that I can print to PDF. 
(Note: You can then copy the output into a Doc and save as 'sarah_jenkins_notes.pdf')
```

---

## 3. Generate Behavioral Incident Log (CSV)
**Prompt:**
```text
Generate a CSV file named `behavioral_logs.csv` with 10 entries. 
Columns: student_id, student_name, date, incident_type, severity, notes.

Include a few entries for Sarah Jenkins and Jordan Smith regarding "Unexcused Absence" and "Late Arrival" to provide data for the AI to find patterns in.
```

---

## 4. Generate Parent Outreach Templates
**Prompt:**
```text
Write three professional email templates and three short SMS templates that a counselor would send to parents.
Templates should include placeholders like {{studentName}}, {{parentName}}, and {{attendanceRate}}.
These will be used to show the "Magic Prompt" generation in the Workflow builder.
```

---

### Pro Tip for the Demo:
Once you have the PDF for Sarah Jenkins, upload it to the **Student Profile** in RIN. Then, in the Chat, ask: *"RIN, based on Sarah's counseling notes, why is her attendance dropping?"* to show off the semantic search!

import { GoogleGenerativeAI } from "@google/generative-ai";
import { apiKeyStorage } from './storage';

let genAI = null;
let model = null;
let currentKey = null;

const initAI = () => {
  const API_KEY = apiKeyStorage.get() || import.meta.env.VITE_GEMINI_API_KEY || '';
  if (API_KEY && API_KEY !== currentKey) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    currentKey = API_KEY;
  }
  return !!model;
};

export const aiService = {
  isConfigured: () => {
    initAI();
    return !!model || !!apiKeyStorage.get() || !!import.meta.env.VITE_GEMINI_API_KEY;
  },
  
  hasValidKey: () => {
    return !!apiKeyStorage.get();
  },
  
  init: initAI,
  
  generateDomainSuggestion: async (answers, language) => {
    initAI();
    
    if (!model) {
      const domains = ['Web Development', 'Data Science & ML', 'UI/UX Design', 'Android Development', 'Cybersecurity'];
      const suggestions = {
        'Web Development': 'You seem interested in building things and working with logic - Web Development is perfect for you!',
        'Data Science & ML': 'Your analytical thinking suggests Data Science would be a great fit!',
        'UI/UX Design': 'Your creative interests make UI/UX Design an excellent choice!',
        'Android Development': 'Building mobile apps matches your interests perfectly!',
        'Cybersecurity': 'Your problem-solving skills are ideal for Cybersecurity!'
      };
      const domain = domains[Math.floor(Math.random() * domains.length)];
      return {
        domain,
        reason: suggestions[domain]
      };
    }

    const languageHint = language === 'hindi' ? 'Hindi' : language === 'marathi' ? 'Marathi' : 'English';
    
    const prompt = `You are a career counselor. A student answered these interest questions:
${answers.map((a, i) => `Q${i + 1}: ${a}`).join('\n')}

Based on these answers, suggest the single most suitable career domain from this list: 
- Web Development
- Data Science & ML
- UI/UX Design
- Android Development
- Cybersecurity

Give your response in ${languageHint} language with:
1. The domain name
2. A 2-line reason for the suggestion

Format: DOMAIN: [name]\nREASON: [reason]`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      const domainMatch = response.match(/DOMAIN:\s*(.+)/i);
      const reasonMatch = response.match(/REASON:\s*(.+)/i);
      
      return {
        domain: domainMatch ? domainMatch[1].trim() : 'Web Development',
        reason: reasonMatch ? reasonMatch[1].trim() : 'A great choice for beginners!'
      };
    } catch (error) {
      console.error('AI Error:', error);
      throw error;
    }
  },

  generateResume: async (formData, language) => {
    initAI();
    
    if (!model) {
      const projects = formData.projects?.filter(p => p.name)?.map(p => 
        `- ${p.name}: ${p.desc || 'Description'}\n  Tech: ${p.tech || 'Various'}`
      ).join('\n') || 'Academic projects in progress';
      
      return `PROFESSIONAL RESUME

${formData.name || 'Your Name'}
${formData.email || 'email@example.com'} | ${formData.phone || '+91 XXXXX XXXXX'}

═══════════════════════════════════════════

OBJECTIVE
Passionate and motivated ${formData.degree || 'engineering'} student seeking internship opportunities to apply academic knowledge and gain practical industry experience.

═══════════════════════════════════════════

EDUCATION
${formData.college || 'College Name'}
${formData.degree || 'Bachelor of Technology'}
Year ${formData.year || '2'} | CGPA: ${formData.cgpa || 'N/A'}

═══════════════════════════════════════════

SKILLS
${formData.skills || 'JavaScript, Python, HTML, CSS, Problem Solving'}

═══════════════════════════════════════════

PROJECTS
${projects}

═══════════════════════════════════════════

LANGUAGES KNOWN
${formData.languages || 'English, Hindi'}
`;
    }

    const prompt = `Convert the following student information into a professional resume in English.
Format it clearly with sections: Objective, Education, Skills, Projects, Languages.
Keep the language formal and suitable for job/internship applications.

Student Info:
${JSON.stringify(formData, null, 2)}`;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('AI Error:', error);
      throw error;
    }
  },

  conductInterview: async (domain, questionNumber, previousQA = [], userAnswer = null, language) => {
    initAI();
    const languageHint = language === 'hindi' ? 'Hindi' : language === 'marathi' ? 'Marathi' : 'English';
    
    if (!model) {
      const questions = {
        'Web Development': [
          'What is the difference between let, const, and var in JavaScript?',
          'Can you explain the CSS Box Model?',
          'What is the Virtual DOM and why does React use it?',
          'How do you handle API calls in React?',
          'What are React Hooks? Give an example.'
        ],
        'Data Science & ML': [
          'What is the difference between supervised and unsupervised learning?',
          'Can you explain overfitting and underfitting?',
          'What is the purpose of train/test split in ML?',
          'What is regularization and why is it used?',
          'Explain how a decision tree works.'
        ],
        default: [
          'Tell me about yourself.',
          'What are your greatest strengths?',
          'Why do you want this internship?',
          'Where do you see yourself in 5 years?',
          'Do you have any questions for us?'
        ]
      };
      
      const domainQuestions = questions[domain] || questions.default;
      const currentQuestion = domainQuestions[(questionNumber - 1) % domainQuestions.length];
      
      if (userAnswer) {
        return {
          feedback: `Good attempt! Your answer shows understanding of the concept. For improvement, try to:\n\n1. Be more specific with examples\n2. Structure your answer clearly\n3. Explain the 'why' behind your answer\n\nKeep practicing!`,
          nextQuestion: questionNumber < 5 ? domainQuestions[questionNumber % domainQuestions.length] : null,
          isComplete: true
        };
      }
      
      return { question: currentQuestion };
    }

    let prompt = `You are a professional technical interviewer for ${domain} roles in India. `;
    
    if (userAnswer && previousQA.length > 0) {
      const history = previousQA.map(qa => `Question: ${qa.question}\nAnswer: ${qa.answer}`).join('\n');
      prompt += `Conversation so far:\n${history}\n\nStudent's latest answer: "${userAnswer}"
      
Give feedback in 3 parts:
1. What was good about this answer
2. What was missing or could be improved
3. A better sample answer

Then ask the next interview question.
      
Always respond in ${languageHint}.`;
    } else {
      prompt += `Start the interview by asking the first question.
Always respond in ${languageHint}.`;
    }

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      const lines = response.split('\n');
      let feedback = '', question = '';
      let inQuestionSection = false;
      
      for (const line of lines) {
        if (line.toLowerCase().includes('next question') || line.includes('?')) {
          inQuestionSection = true;
        }
        if (inQuestionSection) {
          question += line + ' ';
        } else {
          feedback += line + ' ';
        }
      }
      
      return {
        feedback: feedback.trim() || null,
        question: question.trim() || (questionNumber >= 5 ? null : 'Can you elaborate on that?'),
        isComplete: questionNumber >= 5 || !question.trim()
      };
    } catch (error) {
      console.error('AI Error:', error);
      throw error;
    }
  },

  answerInternshipQuestion: async (question, language) => {
    initAI();
    
    if (!model) {
      const q = question.toLowerCase();
      if (q.includes('cover letter')) {
        return `Here's how to write a great cover letter:\n\n1. Start with a strong opening - mention the role and company\n2. Highlight 2-3 relevant skills or experiences\n3. Explain why you're interested in THIS company\n4. End with a call to action\n\nKeep it to one page and tailor it for each application!`;
      }
      if (q.includes('skills')) {
        return `Key skills for internships vary by field, but generally include:\n\n• Technical: Programming, tools, software\n• Communication: Writing, presenting\n• Problem-solving: Critical thinking\n• Teamwork: Collaboration, adaptability\n\nFocus on skills relevant to your domain and include specific examples!`;
      }
      if (q.includes('github') || q.includes('portfolio')) {
        return `To build a strong GitHub portfolio:\n\n1. Upload your best projects with README files\n2. Show variety - different technologies\n3. Contribute to open source\n4. Maintain consistent commit history\n5. Pin your best work\n\nQuality > Quantity!`;
      }
      return 'Configure the Gemini API key in Settings for detailed guidance. Meanwhile, focus on completing your learning roadmap and building projects!';
    }

    const languageHint = language === 'hindi' ? 'Hindi' : language === 'marathi' ? 'Marathi' : 'English';
    
    const prompt = `You are a career guidance assistant helping Indian students with internship preparation.
Answer this question helpfully and concisely in ${languageHint}:

Question: ${question}

Provide practical, actionable advice suitable for college students.`;
    
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('AI Error:', error);
      throw error;
    }
  }
};

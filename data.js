window.PORTFOLIO_DATA = {
  "profile": {
    "name": "Bharathwaj K R",
    "initials": "RK",
    "role": "Aspiring Software Engineer",
    "college": "V.S.B Engineering College",
    "location": "Tamil Nadu, India",
    "email": "ravikap0063@gmail.com",
    "githubUrl": "https://github.com/BharathWaj-K-R",
    "linkedinUrl": "https://www.linkedin.com/in/bharath-waj-k-r",
    "resumeUrl": "resume.pdf",
    "photoUrl": "",
    "leetcodeUrl": ""
  },
  "hero": {
    "kicker": "Aspiring Software Engineer",
    "headlinePrefix": "Hi, I am",
    "tagline": "I build practical software solutions with a strong foundation in",
    "summary": "",
    "typingWords": [
      "Java development.",
      "DSA problem solving.",
      "Linux workflows.",
      "web development."
    ],
    "primaryButton": {
      "label": "Download Resume",
      "hrefField": "resumeUrl"
    },
    "secondaryButton": {
      "label": "View Projects",
      "sectionId": "projects"
    },
    "statusText": "Available for internships",
    "statusValue": "2026"
  },
  "theme": {
    "templateId": "modern-grid",
    "primary": "#c084fc",
    "secondary": "#67e8f9",
    "accent": "#fda4af",
    "background": "#100b17",
    "surface": "#1e1428",
    "text": "#fbf7ff",
    "mutedText": "#c4b5d4",
    "headingFont": "Inter",
    "bodyFont": "Inter",
    "radius": "8px",
    "density": "comfortable"
  },
  "sections": [
    {
      "id": "about",
      "type": "text-block",
      "title": "About",
      "subtitle": "Focused on clean code and real-world problem solving.",
      "visible": true,
      "content": [
        {
          "heading": "Professional Summary",
          "text": "I am an aspiring software engineer from Tamil Nadu with a growing interest in building reliable applications, solving algorithmic problems, and learning the engineering habits behind scalable systems."
        },
        {
          "heading": "Education",
          "text": "V.S.B Engineering College. Software engineering student based in Tamil Nadu, India."
        },
        {
          "heading": "Career Objective",
          "text": "To contribute to impactful software teams, strengthen my skills in Java, DSA, Linux, and web development, and grow into a dependable full-stack software engineer."
        }
      ]
    },
    {
      "id": "skills",
      "type": "tag-list",
      "title": "Skills",
      "subtitle": "Technologies I work with.",
      "visible": true,
      "groups": [
        {
          "title": "Programming Languages",
          "tags": [
            "Java",
            "Python",
            "C",
            "C++"
          ]
        },
        {
          "title": "Web Technologies",
          "tags": [
            "HTML",
            "CSS",
            "JavaScript"
          ]
        },
        {
          "title": "Tools",
          "tags": [
            "Git",
            "GitHub",
            "Linux",
            "VS Code"
          ]
        }
      ]
    },
    {
      "id": "projects",
      "type": "card-list",
      "title": "Projects",
      "subtitle": "Selected engineering work.",
      "visible": true,
      "fields": [
        {
          "key": "title",
          "label": "Title",
          "type": "text",
          "required": true,
          "showInCard": true
        },
        {
          "key": "type",
          "label": "Type",
          "type": "text",
          "required": false,
          "showInCard": true
        },
        {
          "key": "description",
          "label": "Description",
          "type": "textarea",
          "required": false,
          "showInCard": true
        },
        {
          "key": "techstack",
          "label": "Technology Badges",
          "type": "tags",
          "required": false,
          "showInCard": true
        },
        {
          "key": "githuburl",
          "label": "GitHub",
          "type": "url",
          "required": false,
          "showInCard": true
        },
        {
          "key": "liveurl",
          "label": "Live Demo",
          "type": "url",
          "required": false,
          "showInCard": true
        }
      ],
      "items": [
        {
          "title": "AI-Based Interview Preparation System",
          "type": "Full-stack AI",
          "description": "Resume-based interview question generation.\nTechnical and HR interview practice.\nVoice and text answer support.\nPerformance analytics dashboard.",
          "techStack": [
            "Python",
            "Flask",
            "SQLite",
            "HTML",
            "CSS",
            "JavaScript"
          ],
          "githubUrl": "https://github.com/BharathWaj-K-R/Ai-Interview-preparation",
          "liveUrl": ""
        },
        {
          "title": "Stress Level Detection from Handwriting",
          "type": "Machine Learning",
          "description": "Handwriting image upload.\nStress prediction using machine learning.\nStreamlit-based interface.",
          "techStack": [
            "Python",
            "Streamlit",
            "Scikit-Learn"
          ],
          "githubUrl": "",
          "liveUrl": ""
        }
      ]
    },
    {
      "id": "certifications",
      "type": "card-list",
      "title": "Certifications",
      "subtitle": "Learning milestones.",
      "visible": true,
      "fields": [
        {
          "key": "title",
          "label": "Certificate Name",
          "type": "text",
          "required": true,
          "showInCard": true
        },
        {
          "key": "issuer",
          "label": "Issuer / Date",
          "type": "text",
          "required": false,
          "showInCard": true
        },
        {
          "key": "url",
          "label": "Certificate Link",
          "type": "url",
          "required": false,
          "showInCard": true
        }
      ],
      "items": [
        {
          "title": "Java Programming",
          "issuer": "Add issuer and completion date.",
          "url": ""
        },
        {
          "title": "Web Development",
          "issuer": "Add issuer and completion date.",
          "url": ""
        },
        {
          "title": "Data Structures and Algorithms",
          "issuer": "Add issuer and completion date.",
          "url": ""
        }
      ]
    },
    {
      "id": "leetcode",
      "type": "card-list",
      "title": "LeetCode",
      "subtitle": "Consistent coding practice and DSA growth.",
      "visible": true,
      "fields": [
        {
          "key": "title",
          "label": "Title",
          "type": "text",
          "required": true,
          "showInCard": true
        },
        {
          "key": "description",
          "label": "Description",
          "type": "textarea",
          "required": false,
          "showInCard": true
        },
        {
          "key": "problemssolved",
          "label": "Problems Solved",
          "type": "text",
          "required": false,
          "showInCard": true
        },
        {
          "key": "contestrating",
          "label": "Contest Rating",
          "type": "text",
          "required": false,
          "showInCard": true
        },
        {
          "key": "url",
          "label": "Profile Link",
          "type": "url",
          "required": false,
          "showInCard": true
        }
      ],
      "items": [
        {
          "title": "Coding Journey",
          "description": "Tracking problem-solving progress through Java-focused DSA practice, pattern recognition, and regular contest preparation.",
          "problemsSolved": "--",
          "contestRating": "--",
          "url": "https://leetcode.com/u/Bharath_Waj_K_R"
        }
      ]
    },
    {
      "id": "contact",
      "type": "contact",
      "title": "Contact",
      "subtitle": "Let us build something useful.",
      "visible": true
    }
  ]
};
